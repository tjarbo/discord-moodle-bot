import axios from 'axios';

const URL = 'http://localhost:4040/api';

export default axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus() {
    return true;
  },
});
