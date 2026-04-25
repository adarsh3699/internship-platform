const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    type: {
        type: String,
        enum: ["internship", "project", "part-time", "freelance", "research"],
        required: true,
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    skills: {
        type: [String],
        required: [true, "At least one skill is required"],
    },
    domain: {
        type: String,
        enum: [
            "Technology",
            "Design",
            "Marketing",
            "Finance",
            "Healthcare",
            "Education",
            "Engineering",
            "Data Science",
            "Business",
            "Content",
            "Research",
            "Legal",
            "Human Resources",
            "Operations",
            "Other",
        ],
        required: true,
    },
    duration: {
        value: { type: Number, required: true },
        unit: {
            type: String,
            enum: ["days", "weeks", "months"],
            default: "months",
        },
    },
    location: {
        type: String,
        required: true,
    },
    mode: {
        type: String,
        enum: ["remote", "onsite", "hybrid"],
        required: true,
    },
    stipend: {
        isPaid: { type: Boolean, default: false },
        amount: { type: Number, default: 0 },
        currency: { type: String, default: "INR" },
    },
    openings: {
        type: Number,
        default: 1,
        min: 1,
    },
    applicationDeadline: {
        type: Date,
        required: true,
    },
    requirements: {
        type: String,
        maxlength: 2000,
    },
    responsibilities: {
        type: String,
        maxlength: 2000,
    },
    perks: [String],
    status: {
        type: String,
        enum: ["active", "closed", "draft"],
        default: "active",
    },
    applicants: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            status: {
                type: String,
                enum: [
                    "applied",
                    "reviewing",
                    "shortlisted",
                    "rejected",
                    "selected",
                ],
                default: "applied",
            },
            appliedAt: {
                type: Date,
                default: Date.now,
            },
            coverLetter: String,
            resumeUrl: String,
        },
    ],
    views: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Text index for search
opportunitySchema.index({ title: "text", description: "text", skills: "text" });

module.exports = mongoose.model("Opportunity", opportunitySchema);
