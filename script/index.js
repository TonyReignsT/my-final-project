const API_BASE_URL = 'https://api.jikan.moe/v4'; // Jikan API base URL
        const searchInput = document.getElementById('searchInput');
        const searchResultsSection = document.getElementById('searchResultsSection');
        const searchResultsContainer = document.getElementById('searchResults');
        const trendingSection = document.getElementById('trendingSection');
        const trendingResultsContainer = document.getElementById('trendingResults');
        const backButton = document.getElementById('backButton');
        const loader = document.getElementById('loader');
        const detailModal = document.getElementById('detailModal');

        let searchTimeout;

        // --- API Fetching ---
        
        /**
         * Fetches data from the Jikan API.
         * @param {string} endpoint - The API endpoint to fetch.
         * @returns {Promise<Object>} - The JSON response from the API.
         */
        async function fetchData(endpoint) {
            try {
                const response = await fetch(`${API_BASE_URL}/${endpoint}`);
                if (!response.ok) {
                    console.error(`HTTP error! status: ${response.status}`);
                    return null;
                }
                await new Promise(resolve => setTimeout(resolve, 500)); 
                return response.json();
            } catch (error) {
                console.error("Error fetching data: ", error);
                return null;
            }
        }

        // --- Rendering ---

        /**
         * Creates an anime card component.
         * @param {Object} anime - The anime data object from the API.
         * @returns {string} - The HTML string for the anime card.
         */
        function createAnimeCard(anime) {
            // Use a placeholder if image is not available
            const imageUrl = anime.images?.jpg?.large_image_url || `https://placehold.co/300x450/001F3F/7FDBFF?text=${encodeURIComponent(anime.title)}`;
            return `
                <div class="anime-card bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer" data-id="${anime.mal_id}">
                    <img src="${imageUrl}" alt="${anime.title}" class="w-full h-64 object-cover" onerror="this.src='https://placehold.co/300x450/001F3F/7FDBFF?text=Not+Found'; this.onerror=null;">
                    <div class="p-4">
                        <h3 class="font-bold text-md truncate">${anime.title}</h3>
                        <div class="flex items-center mt-2">
                            <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            <span class="text-gray-300 text-sm ml-1">${anime.score || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        /**
         * Renders a list of anime to a specified container.
         * @param {Array} animeList - The array of anime objects.
         * @param {HTMLElement} container - The container element to render into.
         */
        function renderAnimeList(animeList, container) {
            container.innerHTML = animeList.map(createAnimeCard).join('');
            // Add click listeners to the newly created cards
            container.querySelectorAll('.anime-card').forEach(card => {
                card.addEventListener('click', () => showDetails(card.dataset.id));
            });
        }

        


        /**
         * Displays the loading spinner and hides content.
         */
        function showLoader() {
            loader.classList.remove('hidden');
            loader.classList.add('flex');
            searchResultsSection.classList.add('hidden');
            trendingSection.classList.add('hidden');
        }

        /**
         * Hides the loading spinner.
         */
        function hideLoader() {
            loader.classList.remove('flex');
            loader.classList.add('hidden');
        }

        /**
         * Fetches and displays trending anime.
         */
        async function showTrending() {
            showLoader();
            trendingSection.classList.remove('hidden');
            searchResultsSection.classList.add('hidden');
            const data = await fetchData('top/anime?limit=12');
            hideLoader();
            if (data && data.data) {
                renderAnimeList(data.data, trendingResultsContainer);
            } else {
                 trendingResultsContainer.innerHTML = `<p class="text-center col-span-full">Could not fetch trending anime. Please try again later.</p>`;
            }
        }

        /**
         * Fetches and displays search results.
         * @param {string} query - The search query.
         */
        async function handleSearch(query) {
            if (query.length < 3) {
                searchResultsContainer.innerHTML = '';
                return;
            }
            showLoader();
            searchResultsSection.classList.remove('hidden');
            trendingSection.classList.add('hidden');
            const data = await fetchData(`anime?q=${encodeURIComponent(query)}&limit=12`);
            hideLoader();
            if (data && data.data && data.data.length > 0) {
                renderAnimeList(data.data, searchResultsContainer);
            } else {
                searchResultsContainer.innerHTML = `<p class="text-center col-span-full">No results found for "${query}".</p>`;
            }
        }

        /**
         * Fetches and displays detailed information for a specific anime in a modal.
         * @param {string} id - The MyAnimeList ID of the anime.
         */
        async function showDetails(id) {
            detailModal.classList.remove('hidden');
            detailModal.querySelector('.modal-content').innerHTML = `
                <div class="flex justify-center items-center py-16">
                    <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-color"></div>
                </div>`;
            
            const animeData = await fetchData(`anime/${id}/full`);
            if (!animeData || !animeData.data) {
                detailModal.querySelector('.modal-content').innerHTML = `<p class="text-center">Could not fetch details. Please close and try again.</p>`;
                return;
            }

            const anime = animeData.data;
            const imageUrl = anime.images?.jpg?.large_image_url || `https://placehold.co/400x600/001F3F/7FDBFF?text=${encodeURIComponent(anime.title)}`;

            const contentHTML = `
                <button class="absolute top-4 right-4 text-white hover:text-accent-color" onclick="closeModal()">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div class="flex flex-col md:flex-row gap-8">
                    <div class="md:w-1/3 flex-shrink-0">
                        <img src="${imageUrl}" alt="${anime.title}" class="w-full rounded-lg shadow-lg" onerror="this.src='https://placehold.co/400x600/001F3F/7FDBFF?text=Not+Found'; this.onerror=null;">
                    </div>
                    <div class="md:w-2/3">
                        <h2 class="text-3xl font-bold mb-2">${anime.title} <span class="text-xl font-normal text-gray-400">(${anime.title_japanese})</span></h2>
                        <div class="flex items-center space-x-4 mb-4 text-gray-300">
                            <span>${anime.type || 'N/A'}</span>
                            <span>&bull;</span>
                            <span>${anime.episodes || '?'} episodes</span>
                            <span>&bull;</span>
                            <span>${anime.status || 'N/A'}</span>
                            <span>&bull;</span>
                            <span class="flex items-center">
                                <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                ${anime.score || 'N/A'}
                            </span>
                        </div>
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${(anime.genres || []).map(g => `<span class="bg-gray-700 text-gray-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">${g.name}</span>`).join('')}
                        </div>
                        <h3 class="font-bold text-lg mb-2 border-b-2 border-gray-700 pb-1">Synopsis</h3>
                        <p class="text-gray-300 text-sm leading-relaxed">${anime.synopsis ? anime.synopsis.replace(/\n/g, '<br>') : 'No synopsis available.'}</p>
                         <a href="${anime.url}" target="_blank" rel="noopener noreferrer" class="inline-block mt-4 btn-primary font-bold py-2 px-4 rounded-full transition-transform duration-300 hover:scale-105">
                           Read more on MyAnimeList
                        </a>
                    </div>
                </div>
            `;
            detailModal.querySelector('.modal-content').innerHTML = contentHTML;
        }
        
        /**
         * Closes the detail modal.
         */
        function closeModal() {
            detailModal.classList.add('hidden');
            detailModal.querySelector('.modal-content').innerHTML = ''; // Clear content
        }

        // --- Event Listeners ---

        searchInput.addEventListener('keyup', (event) => {
            clearTimeout(searchTimeout);
            const query = event.target.value.trim();
            if (query) {
                // Debouncing the search to avoid API spam
                searchTimeout = setTimeout(() => handleSearch(query), 500);
            } else {
                // If search is cleared, show trending again
                showTrending();
            }
        });

        backButton.addEventListener('click', () => {
             searchInput.value = '';
             showTrending();
        });
        
        // Close modal on escape key press
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        });

        // Close modal on outside click
        detailModal.addEventListener('click', (event) => {
            if (event.target === detailModal) {
                closeModal();
            }
        });

        // --- Initial Load ---
        document.addEventListener('DOMContentLoaded', showTrending);