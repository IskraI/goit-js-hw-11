export class PixabayAPI {
  #BASE_URL = 'https://pixabay.com/api/';
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
    const searchParams = new URLSearchParams({
      ...this.#BASE_SEARCH_PARAMS,
      q: this.query,
      page: this.page,
      per_page: this.per_page,
    });

    return fetch(`${this.#BASE_URL}/?${searchParams}`).then(res => {
      if (!res.ok) {
        throw new Error(res.status);
      }
      return res.json();
    });
  }
}
