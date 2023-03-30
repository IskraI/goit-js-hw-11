import './css/styles.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import pictureCardTpl from './template/picture-card.hbs';
import { PixabayAPI } from './pixabay-api';

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtnEl = document.querySelector('.load-more');

formEl.addEventListener('submit', handleSearchPicture);
loadMoreBtnEl.addEventListener('click', handleLoadMorePicture);

formEl.elements.searchQuery.addEventListener('focus', handleBtn);
formEl.elements[1].disabled = 'true';

function handleBtn(event) {
  formEl.elements[1].removeAttribute('disabled');
  return;
}

const pixabayApi = new PixabayAPI();

let gallerysimple = new SimpleLightbox('.gallery a');

function handleSearchPicture(event) {
  event.preventDefault();

  const searchQuery = event.target.elements.searchQuery.value.trim();
  console.log(searchQuery);
  loadMoreBtnEl.classList.add('is-hidden');

  pixabayApi.query = searchQuery;
  pixabayApi.page = 1;

  if (!searchQuery) {
    Notiflix.Notify.info(`Sorry, Please try again. `);
    return;
  }

  pixabayApi
    .fetchPicturies()
    .then(data => {
      if (!data.hits.length) {
        galleryEl.innerHTML = '';
        Notiflix.Notify.info(
          `Sorry, there are no images matching your search query: ${searchQuery}. Please try again. `
        );
        formEl.reset();
        return;
      }
      if (data.hits.length < pixabayApi.per_page) {
        loadMoreBtnEl.classList.add('is-hidden');
      } else {
        loadMoreBtnEl.classList.remove('is-hidden');
      }
      if (pixabayApi.page === 1) {
        Notiflix.Notify.info(`"Hooray! We found  ${data.totalHits} images.`);
      }
      galleryEl.innerHTML = pictureCardTpl(data.hits);

      gallerysimple.refresh();
      console.log(data);
    })
    .catch(() => {
      loadMoreBtnEl.classList.add('is-hidden');
      galleryEl.textContent = 'Images not found';
    });

  formEl.elements[1].disabled = 'true';
}

function handleLoadMorePicture() {
  pixabayApi.page += 1;
  pixabayApi
    .fetchPicturies()
    .then(data => {
      console.log(
        data.totalHits / data.hits.length,
        pixabayApi.page,
        pixabayApi.per_page,
        data.hits.length
      );
      console.log(data);
      if (data.hits.length < pixabayApi.per_page || data.hits.length === 0) {
        loadMoreBtnEl.classList.add('is-hidden');
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
      galleryEl.insertAdjacentHTML('beforeend', pictureCardTpl(data.hits));
    })
    .catch(err => {
      console.log(err);
    });
}
