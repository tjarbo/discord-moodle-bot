import axios from 'axios';

const URL = '/api';

export default axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus() {
    return true;
  },
});
