// Search only the Course Modules topic names; each result jumps to its row.
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('site-search-input');
        const searchResults = document.getElementById('search-results');
        let lastSearchTarget = null;

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const query = searchInput.value.trim().toLowerCase();
            searchResults.innerHTML = '';
            if (lastSearchTarget) lastSearchTarget.classList.remove('search-match-highlight');

            if (!query) {
                searchResults.textContent = 'Enter a course module topic, such as HTML, programming, or computers.';
                return;
            }

            const topicCells = Array.from(document.querySelectorAll('#courses table tr td:nth-child(2)'));
            const matches = topicCells.filter(cell => cell.textContent.toLowerCase().includes(query));
            if (!matches.length) {
                searchResults.textContent = 'No course module topics found. Try computers, programming, HTML, or problem solving.';
                return;
            }

            const heading = document.createElement('p');
            heading.textContent = matches.length + ' course module topic(s) found. Select a topic to go directly to it:';
            searchResults.appendChild(heading);

            matches.forEach(cell => {
                const row = cell.closest('tr');
                if (!row.id) row.id = 'course-topic-' + row.cells[0].textContent.trim();
                const link = document.createElement('a');
                link.className = 'search-result-link';
                link.href = '#' + row.id;
                link.textContent = cell.textContent.trim();
                link.addEventListener('click', function (clickEvent) {
                    clickEvent.preventDefault();
                    if (lastSearchTarget) lastSearchTarget.classList.remove('search-match-highlight');
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    row.classList.add('search-match-highlight');
                    lastSearchTarget = row;
                    history.replaceState(null, '', '#' + row.id);
                });
                searchResults.appendChild(link);
            });
        });

        // Interactive learning journey: ring, milestones, and saved progress.
        const moduleChecks = Array.from(document.querySelectorAll('.module-complete'));
        const progressLabel = document.getElementById('progress-label');
        const progressRing = document.getElementById('progress-ring');
        const progressPercent = document.getElementById('progress-percent');
        const journeyMessage = document.getElementById('journey-message');
        const journeySteps = Array.from(document.querySelectorAll('.journey-step'));
        const progressStorageKey = 'campusLearnModuleProgress';

        try {
            const savedProgress = JSON.parse(localStorage.getItem(progressStorageKey) || 'null');
            if (Array.isArray(savedProgress)) {
                moduleChecks.forEach((checkbox, index) => {
                    if (typeof savedProgress[index] === 'boolean') checkbox.checked = savedProgress[index];
                });
            }
        } catch (error) {
            // Progress still works for this visit if browser storage is unavailable.
        }

        function updateCourseProgress() {
            const completed = moduleChecks.filter(checkbox => checkbox.checked).length;
            const percentage = Math.round((completed / moduleChecks.length) * 100);
            progressPercent.textContent = percentage + '%';
            progressRing.style.background = 'conic-gradient(#315f91 ' + percentage + '%, #e7edf4 0)';
            progressRing.setAttribute('aria-label', 'Course completion: ' + percentage + ' percent');
            progressLabel.textContent = completed + ' of ' + moduleChecks.length + ' milestones completed';

            journeySteps.forEach((step, index) => {
                const isDone = moduleChecks[index].checked;
                step.classList.toggle('done', isDone);
                const status = step.querySelector('.journey-status');
                if (isDone) status.textContent = '✓ Completed';
                else status.textContent = index === 3 ? 'Final milestone' : 'Milestone ' + (index + 1);
            });

            if (completed === moduleChecks.length) {
                journeyMessage.textContent = '🏆 Journey complete! You have reached every milestone.';
            } else {
                const nextIndex = moduleChecks.findIndex(checkbox => !checkbox.checked);
                journeyMessage.textContent = 'Next up: ' + moduleChecks[nextIndex].parentElement.textContent.trim() + '. Keep going!';
            }

            try {
                localStorage.setItem(progressStorageKey, JSON.stringify(moduleChecks.map(checkbox => checkbox.checked)));
            } catch (error) {
                // The journey remains functional for this visit even if saving is unavailable.
            }
        }

        moduleChecks.forEach(checkbox => checkbox.addEventListener('change', updateCourseProgress));
        updateCourseProgress();

        // This front-end demo confirms submission but does not send an email.
        document.getElementById('contact-form').addEventListener('submit', function (event) {
            event.preventDefault();
            if (!this.reportValidity()) return;
            document.getElementById('contact-success').style.display = 'block';
            this.reset();
        });
