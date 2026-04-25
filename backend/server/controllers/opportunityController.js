const Opportunity = require("../models/Opportunity");
const User = require("../models/User");

// @desc  Get all opportunities with filters
// @route GET /api/opportunities
const getOpportunities = async (req, res) => {
    try {
        const {
            type,
            domain,
            mode,
            skills,
            search,
            page = 1,
            limit = 10,
            sort = "-createdAt",
        } = req.query;
        const query = { status: "active" };

        if (type) query.type = type;
        if (domain) query.domain = domain;
        if (mode) query.mode = mode;
        if (skills) {
            const skillsArr = skills.split(",").map((s) => s.trim());
            query.skills = { $in: skillsArr };
        }
        if (search) {
            query.$text = { $search: search };
        }

        const total = await Opportunity.countDocuments(query);
        const opportunities = await Opportunity.find(query)
            .populate(
                "organization",
                "name companyName industry avatar location",
            )
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        res.json({
            success: true,
            count: opportunities.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            opportunities,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Get single opportunity
// @route GET /api/opportunities/:id
const getOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id).populate(
            "organization",
            "name companyName industry avatar location website bio companySize",
        );
        if (!opportunity) {
            return res
                .status(404)
                .json({ success: false, message: "Opportunity not found" });
        }
        // Increment views
        opportunity.views += 1;
        await opportunity.save();
        res.json({ success: true, opportunity });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Create opportunity
// @route POST /api/opportunities
const createOpportunity = async (req, res) => {
    try {
        req.body.organization = req.user.id;
        if (typeof req.body.skills === "string") {
            req.body.skills = req.body.skills.split(",").map((s) => s.trim());
        }
        if (typeof req.body.perks === "string") {
            req.body.perks = req.body.perks.split(",").map((s) => s.trim());
        }
        const opportunity = await Opportunity.create(req.body);
        res.status(201).json({ success: true, opportunity });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Update opportunity
// @route PUT /api/opportunities/:id
const updateOpportunity = async (req, res) => {
    try {
        let opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity)
            return res
                .status(404)
                .json({ success: false, message: "Not found" });
        if (opportunity.organization.toString() !== req.user.id) {
            return res
                .status(403)
                .json({ success: false, message: "Not authorized" });
        }
        opportunity = await Opportunity.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true },
        );
        res.json({ success: true, opportunity });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Delete opportunity
// @route DELETE /api/opportunities/:id
const deleteOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity)
            return res
                .status(404)
                .json({ success: false, message: "Not found" });
        if (opportunity.organization.toString() !== req.user.id) {
            return res
                .status(403)
                .json({ success: false, message: "Not authorized" });
        }
        await opportunity.deleteOne();
        res.json({ success: true, message: "Opportunity removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Apply to opportunity
// @route POST /api/opportunities/:id/apply
const applyToOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity)
            return res
                .status(404)
                .json({ success: false, message: "Not found" });
        if (opportunity.status !== "active") {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "This opportunity is no longer active",
                });
        }
        const alreadyApplied = opportunity.applicants.find(
            (a) => a.student.toString() === req.user.id,
        );
        if (alreadyApplied) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Already applied to this opportunity",
                });
        }
        opportunity.applicants.push({
            student: req.user.id,
            coverLetter: req.body.coverLetter || "",
            resumeUrl: req.body.resumeUrl || "",
        });
        await opportunity.save();
        res.json({
            success: true,
            message: "Application submitted successfully!",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Get my applications (student)
// @route GET /api/opportunities/my-applications
const getMyApplications = async (req, res) => {
    try {
        const opportunities = await Opportunity.find({
            "applicants.student": req.user.id,
        }).populate("organization", "name companyName avatar");
        const applications = opportunities.map((opp) => {
            const myApp = opp.applicants.find(
                (a) => a.student.toString() === req.user.id,
            );
            return {
                opportunity: {
                    _id: opp._id,
                    title: opp.title,
                    type: opp.type,
                    organization: opp.organization,
                    mode: opp.mode,
                    location: opp.location,
                    stipend: opp.stipend,
                },
                status: myApp.status,
                appliedAt: myApp.appliedAt,
                coverLetter: myApp.coverLetter,
            };
        });
        res.json({ success: true, applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Get applicants for an opportunity (organization)
// @route GET /api/opportunities/:id/applicants
const getApplicants = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id).populate(
            "applicants.student",
            "name email skills bio education portfolio",
        );
        if (!opportunity)
            return res
                .status(404)
                .json({ success: false, message: "Not found" });
        if (opportunity.organization.toString() !== req.user.id) {
            return res
                .status(403)
                .json({ success: false, message: "Not authorized" });
        }
        res.json({ success: true, applicants: opportunity.applicants });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Update applicant status
// @route PUT /api/opportunities/:id/applicants/:studentId
const updateApplicantStatus = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity)
            return res
                .status(404)
                .json({ success: false, message: "Not found" });
        if (opportunity.organization.toString() !== req.user.id) {
            return res
                .status(403)
                .json({ success: false, message: "Not authorized" });
        }
        const applicant = opportunity.applicants.find(
            (a) => a.student.toString() === req.params.studentId,
        );
        if (!applicant)
            return res
                .status(404)
                .json({ success: false, message: "Applicant not found" });
        applicant.status = req.body.status;
        await opportunity.save();
        res.json({ success: true, message: "Applicant status updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Get matched opportunities for student
// @route GET /api/opportunities/matched
const getMatchedOpportunities = async (req, res) => {
    try {
        const student = await User.findById(req.user.id);
        if (!student.skills || student.skills.length === 0) {
            return res.json({ success: true, opportunities: [] });
        }
        const opportunities = await Opportunity.find({
            status: "active",
            skills: { $in: student.skills },
        })
            .populate("organization", "name companyName avatar industry")
            .sort("-createdAt")
            .limit(10);

        // Score each opportunity
        const scored = opportunities
            .map((opp) => {
                const matchCount = opp.skills.filter((s) =>
                    student.skills.includes(s),
                ).length;
                const matchScore = Math.round(
                    (matchCount / opp.skills.length) * 100,
                );
                return { ...opp.toObject(), matchScore };
            })
            .sort((a, b) => b.matchScore - a.matchScore);

        res.json({ success: true, opportunities: scored });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Save/unsave opportunity
// @route POST /api/opportunities/:id/save
const saveOpportunity = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const oppId = req.params.id;
        const isSaved = user.savedOpportunities.includes(oppId);
        if (isSaved) {
            user.savedOpportunities = user.savedOpportunities.filter(
                (id) => id.toString() !== oppId,
            );
        } else {
            user.savedOpportunities.push(oppId);
        }
        await user.save();
        res.json({
            success: true,
            saved: !isSaved,
            message: isSaved ? "Opportunity unsaved" : "Opportunity saved",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Get organization's posted opportunities
// @route GET /api/opportunities/my-posts
const getMyPosts = async (req, res) => {
    try {
        const opportunities = await Opportunity.find({
            organization: req.user.id,
        }).sort("-createdAt");
        res.json({ success: true, opportunities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getOpportunities,
    getOpportunity,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    applyToOpportunity,
    getMyApplications,
    getApplicants,
    updateApplicantStatus,
    getMatchedOpportunities,
    saveOpportunity,
    getMyPosts,
};
