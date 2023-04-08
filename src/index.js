import './css/styles.css';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import pictureCardTpl from './template/picture-card.hbs';
import { PixabayAPI } from './pixabay-api';

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtnEl = document.querySelector('.load-more');
const formElSearchBtn = formEl.elements[1];

formEl.addEventListener('submit', handleSearchPicture);
loadMoreBtnEl.addEventListener('click', handleLoadMorePicture);

formEl.elements.searchQuery.addEventListener('focus', searchBtnActive);

function searchBtnActive() {
  formEl.elements.searchQuery.value = '';
  formElSearchBtn.removeAttribute('disabled');
}
function searchBtnNotActive() {
  formElSearchBtn.setAttribute('disabled', true);
}

function loadMoreBtnNotActive() {
  loadMoreBtnEl.classList.add('is-hidden');
}
function loadMoreBtnActive() {
  loadMoreBtnEl.classList.remove('is-hidden');
}

function scrollingPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
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
  loadMoreBtnNotActive();

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

    if (!(data.hits.length < pixabayApi.per_page)) {
      loadMoreBtnActive();
    }

    Notiflix.Notify.success(`"Hooray! We found  ${data.totalHits} images.`);
    galleryEl.innerHTML = pictureCardTpl(data.hits);

    gallerysimple.refresh();
  } catch (err) {
    galleryEl.textContent = 'Images not found';
  }

  searchBtnNotActive();
  formEl.elements.searchQuery.blur();
}

async function handleLoadMorePicture() {
  pixabayApi.page += 1;
  try {
    const { data } = await pixabayApi.fetchPicturies();

    const lastPage = Math.ceil(data.totalHits / pixabayApi.per_page);
    if (pixabayApi.page === lastPage || data.hits.length === 0) {
      loadMoreBtnNotActive();
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
    galleryEl.insertAdjacentHTML('beforeend', pictureCardTpl(data.hits));
    scrollingPage();
    loadMoreBtnEl.blur();
    gallerysimple.refresh();
  } catch (err) {
    console.log(err);
  }
}
