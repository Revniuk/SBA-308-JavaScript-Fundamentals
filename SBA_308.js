function getLearnerData(courseInfo, assignmentGroup, learnerSubmissions) {
    // Validate input data
    validateCourse(courseInfo, assignmentGroup);

    // Initialize result array
    let result = [];

    // Iterate over learnerSubmissions
    for (let i = 0; i < learnerSubmissions.length; i++) {
        try {
            // Process each learner's submission and calculate weighted average
            let learnerData = processLearnerSubmission(learnerSubmissions[i], assignmentGroup);
            
            if (learnerData !== null) {
                result.push(learnerData);
            }
        } catch (error) {
            // Handle errors gracefully
            console.error(`Error processing learner submission: ${error.message}`);
        }
    }

    return result;
}

function validateCourse(courseInfo, assignmentGroup) {
    // Check if AssignmentGroup belongs to the correct course
    if (courseInfo.id !== assignmentGroup.course_id) {
        throw new Error('Invalid input: AssignmentGroup does not belong to the specified course.');
    }

    // Add additional validation as needed
}

function processLearnerSubmission(learnerSubmission, assignmentGroup) {
    // Extract relevant data from parameters
    let { learner_id, assignment_id, submission } = learnerSubmission;
    let { assignments, group_weight } = assignmentGroup;

    // Find the assignment corresponding to the learner's submission
    let assignment = findAssignmentById(assignments, assignment_id);

    // Check if assignment is not yet due
    if (isAssignmentDue(assignment)) {
        // Calculate weighted score considering late submissions
        let weightedScore = calculateWeightedScore(submission, assignment);

        // Calculate learner's total weighted average
        let weightedAverage = calculateWeightedAverage(weightedScore, group_weight);

        // Prepare learner data object
        let learnerData = {
            id: learner_id,
            avg: weightedAverage,
            [assignment_id]: weightedScore,
            // Add more assignment scores as needed
        };

        return learnerData;
    } else {
        // Assignment is not yet due, skip processing
        return null;
    }
}

function findAssignmentById(assignments, assignment_id) {
    // Find the assignment in the assignments array by ID
    return assignments.find(assignment => assignment.id === assignment_id);
}

function isAssignmentDue(assignment) {
    // Check if the assignment is due by comparing due_at with the current date
    // Return true if due_at is after the current date
    return new Date(assignment.due_at) > new Date();
}

function calculateWeightedScore(submission, assignment) {
    // Calculate the weighted score considering late submissions
    let latePenalty = calculateLatePenalty(submission.submitted_at, assignment.due_at);
    let weightedScore = (submission.score - latePenalty) / assignment.points_possible * 100;

    return weightedScore;
}

function calculateLatePenalty(submitted_at, due_at) {
    // Calculate the late penalty (if any) based on submitted_at and due_at
    // Return 0 if the submission is not late
    // Otherwise, deduct 10% per day from the total points_possible
    const lateSubmissionDate = new Date(submitted_at);
    const dueDate = new Date(due_at);

    if (lateSubmissionDate > dueDate) {
        // Calculate the number of days late
        const daysLate = Math.ceil((lateSubmissionDate - dueDate) / (1000 * 60 * 60 * 24));

        // Deduct 10% per day from the total points_possible
        const penaltyPercentage = daysLate * 0.1;
        
        return penaltyPercentage;
    }

    // No late penalty
    return 0;
}

function calculateWeightedAverage(weightedScore, group_weight) {
    // Calculate the weighted average considering the group weight
    return (weightedScore * group_weight) / 100;
}

// Sample Data
let courseInfo = {
    id: 1,
    name: "Sample Course"
};

let assignmentGroup = {
    id: 1,
    name: "Homework",
    course_id: 1,
    group_weight: 20,
    assignments: [
        {
            id: 101,
            name: "Assignment 1",
            due_at: "2023-12-15T23:59:59",
            points_possible: 100
        },
        // Add more assignments as needed
    ]
};

let learnerSubmissions = [
    {
        learner_id: 1001,
        assignment_id: 101,
        submission: {
            submitted_at: "2023-12-16T12:00:00", // Late submission
            score: 85
        }
    },
    // Add more learner submissions as needed
];

// Run the program
let result = getLearnerData(courseInfo, assignmentGroup, learnerSubmissions);
console.log(result);
