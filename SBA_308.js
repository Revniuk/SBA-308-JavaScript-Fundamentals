function getLearnerData(courseInfo, assignmentGroup, learnerSubmissions) {
   
    validateCourse(courseInfo, assignmentGroup);

   
    let result = [];

   
    for (let i = 0; i < learnerSubmissions.length; i++) {
        try {
            let learnerData = processLearnerSubmission(learnerSubmissions[i], assignmentGroup);
            
            if (learnerData !== null) {
                result.push(learnerData);
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
    }

    return result;
}

function validateCourse(courseInfo, assignmentGroup) {
    if (courseInfo.id !== assignmentGroup.course_id) {
        throw new Error('AssignmentGroup does not belong to the  course.');
    }

}

function processLearnerSubmission(learnerSubmission, assignmentGroup) {
    let { learner_id, assignment_id, submission } = learnerSubmission;
    let { assignments, group_weight } = assignmentGroup;

    let assignment = findAssignmentById(assignments, assignment_id);

    if (isAssignmentDue(assignment)) {
        let weightedScore = calculateWeightedScore(submission, assignment);

        let weightedAverage = calculateWeightedAverage(weightedScore, group_weight);

        let learnerData = {
            id: learner_id,
            avg: weightedAverage,
            [assignment_id]: weightedScore,
        };

        return learnerData;
    } else {
        return null;
    }
}

function findAssignmentById(assignments, assignment_id) {
    return assignments.find(assignment => assignment.id === assignment_id);
}

function isAssignmentDue(assignment) {
    return new Date(assignment.due_at) > new Date();
}

function calculateWeightedScore(submission, assignment) {
    let latePenalty = calculateLatePenalty(submission.submitted_at, assignment.due_at);
    let weightedScore = (submission.score - latePenalty) / assignment.points_possible * 100;

    return weightedScore;
}

function calculateLatePenalty(submitted_at, due_at) {
    // Return 0 if the submission is not late
    // Else, deduct 10% per day from the total points_possible
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


// Run the program
let result = getLearnerData(courseInfo, assignmentGroup, learnerSubmissions);
console.log(result);
