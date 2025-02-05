export default class DifficultySelector {
    static difficulties = {
        easy: {
            name: 'Easy',
            hitChance: 0.6,     // 60% chance to make smart moves
            smartTargeting: true
        },
        medium: {
            name: 'Medium',
            hitChance: 0.85,    // 85% chance to make smart moves
            smartTargeting: true
        },
        hard: {
            name: 'Hard',
            hitChance: 1.0,     // Always makes smart moves
            smartTargeting: true,
            enhancedProbability: true  // Uses advanced probability calculations
        }
    };

    static currentDifficulty = 'medium';

    static createSelector() {
        const container = document.createElement('div');
        container.className = 'difficulty-selector';

        const label = document.createElement('div');
        label.className = 'difficulty-label';
        label.textContent = 'Difficulty:';

        const select = document.createElement('select');
        select.className = 'difficulty-select';

        Object.entries(this.difficulties).forEach(([key, value]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value.name;
            option.selected = key === this.currentDifficulty;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
        });

        container.appendChild(label);
        container.appendChild(select);
        return container;
    }

    static getDifficultySettings() {
        return this.difficulties[this.currentDifficulty];
    }
}
