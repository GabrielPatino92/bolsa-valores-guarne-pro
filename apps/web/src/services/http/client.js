import axios from 'axios';
import { env } from '../env.js';

export const httpClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json'
  }
});
