import axios from '@api/axiosConfig';
import { About } from '@interfaces/about';
import { Home } from '@/interfaces/home';
import { Contact } from '@interfaces/contact';

const api = {
  home: {
    get: async () => {
      try {
        const response = await axios.get<Home>('home');
        return response.data?.content;
      } catch (error) {
        throw error;
      }
    },
  },
  about: {
    get: async () => {
      try {
        const response = await axios.get<About>('about');
        return response.data?.content;
      } catch (error) {
        throw error;
      }
    },
  },
  contact: {
    create: async (contact: Contact) => {
      try {
        const response = await axios.post('contact', contact);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  },
};

export default api;
