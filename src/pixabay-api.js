import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://pixabay.com/api/',
});

export class PixabayAPI {
  #API_KEY = '34827172-203207521b1a5ab45d0b9403b';
  #BASE_SEARCH_PARAMS = {
    key: this.#API_KEY,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
  };

  page = 1;
  query = null;
  per_page = 40;

  fetchPicturies() {
    return instance.get('', {
      params: {
        ...this.#BASE_SEARCH_PARAMS,
        q: this.query,
        page: this.page,
        per_page: this.per_page,
      },
    });
  }
}
