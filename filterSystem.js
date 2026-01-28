// filterSystem.js

// This function filters member cards based on various criteria
function filterMemberCards(members, filters) {
    return members.filter(member => {
        let matches = true;

        // Check for rank war viability
        if (filters.rankWarViability && member.rankWarViability !== filters.rankWarViability) {
            matches = false;
        }

        // Check for respect return potential
        if (filters.respectReturnPotential && member.respectReturnPotential < filters.respectReturnPotential) {
            matches = false;
        }

        // Check for chain bonuses
        if (filters.chainBonuses && !filters.chainBonuses.includes(member.chainBonus)) {
            matches = false;
        }

        // Check for online status
        if (filters.onlineStatus !== undefined && member.onlineStatus !== filters.onlineStatus) {
            matches = false;
        }

        // Custom filter combinations
        for (const key in filters.custom) {
            if (filters.custom.hasOwnProperty(key) && member[key] !== filters.custom[key]) {
                matches = false;
            }
        }

        return matches;
    });
}

// Example usage:
// const filteredMembers = filterMemberCards(membersArray, filtersObject);