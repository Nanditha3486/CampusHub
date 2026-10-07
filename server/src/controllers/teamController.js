import { Team } from '../models/Team.js';
import { TeamRequest } from '../models/TeamRequest.js';
import { Notification } from '../models/Notification.js';
import { getDBStatus } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';

export const getTeams = async (req, res) => {
  try {
    const { domain, search } = req.query;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      let query = {};
      if (domain && domain !== 'All') query.domain = domain;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { tagline: { $regex: search, $options: 'i' } },
          { requiredSkills: { $regex: search, $options: 'i' } },
        ];
      }

      const teams = await Team.find(query)
        .populate('leader', 'name college department avatar')
        .populate('members', 'name college department avatar')
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: teams.length, teams });
    } else {
      let filtered = [...memoryStore.teams];
      if (domain && domain !== 'All') filtered = filtered.filter((t) => t.domain === domain);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.tagline.toLowerCase().includes(q) ||
            (t.requiredSkills && t.requiredSkills.some((s) => s.toLowerCase().includes(q)))
        );
      }
      return res.json({ success: true, count: filtered.length, teams: filtered });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { name, tagline, description, domain, requiredSkills, openRoles } = req.body;
    const userId = req.user._id || req.user.id;

    if (!name || !tagline || !description) {
      return res.status(400).json({ success: false, message: 'Please provide team name, tagline, and description' });
    }

    const { isMongoConnected } = getDBStatus();
    const skillsArr = Array.isArray(requiredSkills)
      ? requiredSkills
      : typeof requiredSkills === 'string'
      ? requiredSkills.split(',').map((s) => s.trim())
      : [];
    const rolesArr = Array.isArray(openRoles)
      ? openRoles
      : typeof openRoles === 'string'
      ? openRoles.split(',').map((r) => r.trim())
      : [];

    if (isMongoConnected) {
      const team = await Team.create({
        name,
        tagline,
        description,
        domain: domain || 'Web Development',
        leader: userId,
        members: [userId],
        requiredSkills: skillsArr,
        openRoles: rolesArr,
        status: 'Open',
      });

      const populatedTeam = await Team.findById(team._id)
        .populate('leader', 'name college department avatar')
        .populate('members', 'name college department avatar');

      return res.status(201).json({ success: true, team: populatedTeam });
    } else {
      const teamId = 'team_' + memoryStore.generateId();
      const newTeam = {
        _id: teamId,
        id: teamId,
        name,
        tagline,
        description,
        domain: domain || 'Web Development',
        leader: req.user,
        members: [req.user],
        requiredSkills: skillsArr,
        openRoles: rolesArr,
        status: 'Open',
        createdAt: new Date().toISOString(),
      };

      memoryStore.teams.unshift(newTeam);
      return res.status(201).json({ success: true, team: newTeam });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const sendJoinRequest = async (req, res) => {
  try {
    const { id: teamId } = req.params;
    const { pitch, roleApplied } = req.body;
    const userId = req.user._id || req.user.id;

    if (!pitch || !roleApplied) {
      return res.status(400).json({ success: false, message: 'Please provide pitch and role applied' });
    }

    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const team = await Team.findById(teamId);
      if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

      // Check duplicate application
      const existingReq = await TeamRequest.findOne({ team: teamId, applicant: userId });
      if (existingReq) {
        return res.status(400).json({ success: false, message: 'You have already applied to this team' });
      }

      const teamReq = await TeamRequest.create({
        team: teamId,
        applicant: userId,
        pitch,
        roleApplied,
      });

      // Send notification to team leader
      await Notification.create({
        recipient: team.leader,
        sender: userId,
        type: 'team_invite',
        title: 'New Team Join Request',
        message: `${req.user.name} applied for "${roleApplied}" on team "${team.name}"`,
        link: '/teams',
      });

      return res.status(201).json({ success: true, request: teamReq });
    } else {
      const team = memoryStore.teams.find((t) => t._id === teamId || t.id === teamId);
      if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

      const existingReq = memoryStore.teamRequests.find(
        (r) => (r.team === teamId || r.team._id === teamId) && (r.applicant === userId || r.applicant._id === userId)
      );
      if (existingReq) {
        return res.status(400).json({ success: false, message: 'You have already applied to this team' });
      }

      const reqId = 'req_' + memoryStore.generateId();
      const newReq = {
        _id: reqId,
        id: reqId,
        team: teamId,
        applicant: req.user,
        pitch,
        roleApplied,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      memoryStore.teamRequests.unshift(newReq);

      const leaderId = team.leader._id || team.leader.id || team.leader;
      memoryStore.notifications.unshift({
        _id: 'notif_' + memoryStore.generateId(),
        id: 'notif_' + memoryStore.generateId(),
        recipient: leaderId,
        sender: req.user,
        type: 'team_invite',
        title: 'New Team Join Request',
        message: `${req.user.name} applied for "${roleApplied}" on team "${team.name}"`,
        link: '/teams',
        read: false,
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json({ success: true, request: newReq });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTeamRequests = async (req, res) => {
  try {
    const { id: teamId } = req.params;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const requests = await TeamRequest.find({ team: teamId })
        .populate('applicant', 'name college department avatar bio skills')
        .sort({ createdAt: -1 });
      return res.json({ success: true, requests });
    } else {
      const requests = memoryStore.teamRequests.filter(
        (r) => r.team === teamId || (r.team && r.team._id === teamId)
      );
      return res.json({ success: true, requests });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const respondToJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const userId = req.user._id || req.user.id;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be accepted or rejected' });
    }

    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const request = await TeamRequest.findById(requestId).populate('team');
      if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

      if (request.team.leader.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Only team leader can manage join requests' });
      }

      request.status = status;
      await request.save();

      if (status === 'accepted') {
        const team = await Team.findById(request.team._id);
        if (!team.members.includes(request.applicant)) {
          team.members.push(request.applicant);
          await team.save();
        }
      }

      await Notification.create({
        recipient: request.applicant,
        sender: userId,
        type: status === 'accepted' ? 'request_accepted' : 'request_rejected',
        title: `Team Request ${status === 'accepted' ? 'Accepted!' : 'Declined'}`,
        message: `Your request to join "${request.team.name}" was ${status}.`,
        link: '/teams',
      });

      return res.json({ success: true, request });
    } else {
      const request = memoryStore.teamRequests.find((r) => r._id === requestId || r.id === requestId);
      if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

      const team = memoryStore.teams.find((t) => t._id === request.team || t.id === request.team || t._id === request.team._id);
      const leaderId = team.leader._id || team.leader.id || team.leader;

      if (leaderId !== userId) {
        return res.status(403).json({ success: false, message: 'Only team leader can manage join requests' });
      }

      request.status = status;

      const applicantObj = typeof request.applicant === 'object' ? request.applicant : memoryStore.users.find(u => u._id === request.applicant || u.id === request.applicant);
      const applicantId = applicantObj._id || applicantObj.id;

      if (status === 'accepted' && team) {
        const alreadyMember = team.members.some(m => (m._id || m.id || m) === applicantId);
        if (!alreadyMember) {
          team.members.push(applicantObj);
        }
      }

      memoryStore.notifications.unshift({
        _id: 'notif_' + memoryStore.generateId(),
        id: 'notif_' + memoryStore.generateId(),
        recipient: applicantId,
        sender: req.user,
        type: status === 'accepted' ? 'request_accepted' : 'request_rejected',
        title: `Team Request ${status === 'accepted' ? 'Accepted!' : 'Declined'}`,
        message: `Your request to join "${team ? team.name : 'the team'}" was ${status}.`,
        link: '/teams',
        read: false,
        createdAt: new Date().toISOString(),
      });

      return res.json({ success: true, request });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
