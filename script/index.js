
        const API_BASE_URL = 'https://api.jikan.moe/v4';
        const searchInput = document.getElementById('searchInput');
        const searchResultsSection = document.getElementById('searchResultsSection');
        const searchResultsContainer = document.getElementById('searchResults');
        const trendingSection = document.getElementById('trendingSection');
        const trendingResultsContainer = document.getElementById('trendingResults');
        const backButton = document.getElementById('backButton');
        const loader = document.getElementById('loader');
        const detailModal = document.getElementById('detailModal');


         // Fetches data from the Jikan API 
        
        function fetchData(endpoint) {
            const url = `${API_BASE_URL}/${endpoint}`;
           
            return fetch(url)
                .then(response => {
                    // check if the response is successful
                    if (!response.ok) {
                        console.error(`HTTP error! status: ${response.status}`);
                        return null; // Return nothing if there's an error.
                    }
                    // convert the response to JSON if successful
                    return response.json();
                })
                .catch(error => {
                    console.error("Error fetching data: ", error);
                    return null;
                });
        }

        // Creates the HTML for a single anime card.

        function createAnimeCard(anime) {
            const imageUrl = anime.images?.jpg?.large_image_url || `https://placehold.co/300x450/001F3F/7FDBFF?text=${encodeURIComponent(anime.title)}`; //encodeURIComponent to handle special characters in title
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
        
       // Renders a list of anime cards to the screen.
        function renderAnimeList(animeList, container) {
            container.innerHTML = animeList.map(createAnimeCard).join('');
            
            // add click event listeners to each card
            container.querySelectorAll('.anime-card').forEach(card => {
                card.addEventListener('click', () => {
                    // When a card is clicked, we get its ID and show the details.
                    const animeId = card.dataset.id;
                    showDetails(animeId);
                });
            });
        }

        // Trending anime 
        function showTrending() {
            loader.classList.remove('hidden'); // Show loading spinner
            trendingSection.classList.add('hidden'); // Hide content
            
            fetchData('top/anime?limit=12') // Fetch top 12 trending anime
                .then(apiResponse => {
                    loader.classList.add('hidden'); // Hide spinner
                    trendingSection.classList.remove('hidden'); // Show content section
                    
                    if (apiResponse && apiResponse.data) {
                        // render the list of anime cards
                        renderAnimeList(apiResponse.data, trendingResultsContainer);
                    } else {
                        trendingResultsContainer.innerHTML = `<p class="text-center col-span-full">Could not fetch trending anime.</p>`;
                    }
                });
        }

       // search functionality.
        function handleSearch(query) {
            loader.classList.remove('hidden'); // Show loading spinner
            searchResultsSection.add('hidden'); // Hide content
            trendingSection.classList.add('hidden');

            fetchData(`anime?q=${encodeURIComponent(query)}&limit=12`)
                .then(apiResponse => {
                    loader.classList.add('hidden'); // Hide spinner
                    searchResultsSection.classList.remove('hidden'); // Show content section

                    if (apiResponse && apiResponse.data.length > 0) {
                        renderAnimeList(apiResponse.data, searchResultsContainer);
                    } else {
                        searchResultsContainer.innerHTML = `<p class="text-center col-span-full">No results found for "${query}".</p>`;
                    }
                });
        }
        
      // Shows detailed information about a specific anime in a pop-up modal.
        function showDetails(id) {
            detailModal.classList.remove('hidden'); // Show the modal background
            // Show a temporary loader inside the modal
            detailModal.querySelector('.modal-content').innerHTML = `<div class="flex justify-center items-center py-16"><div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-color"></div></div>`;
            
            fetchData(`anime/${id}/full`)
                .then(apiResponse => {
                    if (!apiResponse || !apiResponse.data) {
                        detailModal.querySelector('.modal-content').innerHTML = `<p class="text-center">Could not fetch details.</p>`;
                        return;
                    }
                    
                    const anime = apiResponse.data;
                    const imageUrl = anime.images?.jpg?.large_image_url || `https://placehold.co/400x600/001F3F/7FDBFF?text=${encodeURIComponent(anime.title)}`;
                    
                    // Create the detailed HTML content
                    const contentHTML = `
                        <button class="absolute top-4 right-4 text-white hover:text-accent-color" onclick="closeModal()">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <div class="flex flex-col md:flex-row gap-8">
                            <div class="md:w-1/3 flex-shrink-0"><img src="${imageUrl}" alt="${anime.title}" class="w-full rounded-lg shadow-lg"></div>
                            <div class="md:w-2/3">
                                <h2 class="text-3xl font-bold mb-2">${anime.title}</h2>
                                <div class="flex flex-wrap gap-2 mb-4">${(anime.genres || []).map(g => `<span class="bg-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">${g.name}</span>`).join('')}</div>
                                <h3 class="font-bold text-lg mb-2">Synopsis</h3>
                                <p class="text-gray-300 text-sm leading-relaxed">${anime.synopsis || 'No synopsis available.'}</p>
                                <a href="${anime.url}" target="_blank" class="inline-block mt-4 btn-primary font-bold py-2 px-4 rounded-full">Read More</a>
                            </div>
                        </div>
                    `;
                    // Replaces the loader with the final content
                    detailModal.querySelector('.modal-content').innerHTML = contentHTML;
                });
        }
        
        // Closes the pop-up modal.
        function closeModal() {
            detailModal.classList.add('hidden');
        }

        // event listeners
        // When the user types in the search bar...
        searchInput.addEventListener('keyup', (event) => {
            const query = event.target.value.trim();
            if (query.length > 2) {
                // Run search when typing more than 2 characters
                trendingSection.classList.add('hidden');
                searchResultsSection.classList.remove('hidden');
                handleSearch(query);
            } else {
                // show the trending section.
                searchResultsSection.classList.add('hidden');
                trendingSection.classList.remove('hidden');
            }
        });

        // When the user clicks the "Back" button...
        // backButton.addEventListener('click', () => {
        //      searchInput.value = ''; // Clear the search bar
        //      searchResultsSection.classList.add('hidden'); // Hide search results
        //      trendingSection.classList.remove('hidden'); // Show trending section
        // });
        
        // When the user presses the 'Escape' key...
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeModal();
        });

        // When the user clicks on the dark background of the modal...
        detailModal.addEventListener('click', (event) => {
            if (event.target === detailModal) closeModal();
        });

        
        // Initial page load
        document.addEventListener('DOMContentLoaded', showTrending);