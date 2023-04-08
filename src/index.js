import './css/styles.css';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import pictureCardTpl from './template/picture-card.hbs';
import { PixabayAPI } from './pixabay-api';

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const formElSearchBtn = formEl.elements['searchbtn'];

formEl.addEventListener('submit', handleSearchPicture);

formEl.elements.searchQuery.addEventListener('focus', searchBtnActive);

function searchBtnActive() {
  formElSearchBtn.removeAttribute('disabled');
}
function searchBtnNotActive() {
  formEl.elements.searchQuery.blur();
  formElSearchBtn.setAttribute('disabled', true);
}

const pixabayApi = new PixabayAPI();
let gallerysimple = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

async function handleSearchPicture(event) {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value.trim();
  console.log(searchQuery);
  pixabayApi.query = searchQuery;
  pixabayApi.page = 1;
  galleryEl.innerHTML = '';
  observer.unobserve(sentinel);

  if (!searchQuery) {
    Notiflix.Notify.warning(`Sorry, Please try again. `);
    return;
  }

  try {
    const { data } = await pixabayApi.fetchPicturies();
    if (!data.hits.length) {
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query: ${searchQuery}. Please try again. `
      );
      formEl.reset();
      return;
    }

    Notiflix.Notify.success(`"Hooray! We found  ${data.totalHits} images.`);
    galleryEl.innerHTML = pictureCardTpl(data.hits);

    gallerysimple.refresh();
    if (pixabayApi.page < Math.ceil(data.totalHits / pixabayApi.per_page)) {
      observer.observe(sentinel);
    }
  } catch (err) {
    galleryEl.textContent = 'Images not found';
  }
  searchBtnNotActive();
}

const options = {
  rootMargin: '150px',
};
const observer = new IntersectionObserver(onEntry, options);

const sentinel = document.querySelector('#sentinel');

async function onEntry(entries) {
  console.log(entries);
  try {
    if (entries[0].isIntersecting && pixabayApi.query !== null) {
      console.log('пора грузить');
      pixabayApi.page += 1;
      response = await pixabayApi.fetchPicturies();
      const { data } = response;

      galleryEl.insertAdjacentHTML('beforeend', pictureCardTpl(data.hits));
      gallerysimple.refresh();
      if (pixabayApi.page === Math.ceil(data.totalHits / pixabayApi.per_page)) {
        observer.unobserve(sentinel);
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
    }
  } catch (err) {
    galleryEl.textContent = 'Images not found';
  }
}
