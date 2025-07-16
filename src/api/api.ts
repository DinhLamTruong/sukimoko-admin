import axios from '@api/axiosConfig'
import {About} from '@interfaces/about'
import { Home } from '@/interfaces/home'
import {Blog, Filter} from '@interfaces/blog'
import {Contact} from '@interfaces/contact'
import {Design} from '@interfaces/design'
// import { Visit } from '@/interfaces/visit'

const api = {
  blog: {
    get: async (params?: Filter) => {
      try {
        const response = await axios.get<{data: Blog[]; total: number}>('blog', {params})       
        return response.data
      } catch (error) {
        throw error
      }
    },
    getById: async (id: number) => {
      try {
        const response = await axios.get<Blog>(`blog/${id}`)
        return response.data
      } catch (error) {
        throw error
      }
    },
  },
  design: {
    get: async () => {
      try {
        const response = await axios.get<{data: Design[]; total: number}>('design')
        return response.data
      } catch (error) {
        throw error
      }
    },
    getById: async (id: number) => {
      try {
        const response = await axios.get<Blog>(`design/${id}`)
        return response.data
      } catch (error) {
        throw error
      }
    },
  },
  home: {
    get: async () => {
      try {
        const response = await axios.get<Home>('home')
        return response.data?.content
      } catch (error) {
        throw error
      }
    },
  },
  about: {
    get: async () => {
      try {
        const response = await axios.get<About>('about')
        return response.data?.content
      } catch (error) {
        throw error
      }
    },
  },
  contact: {
    create: async (contact: Contact) => {
      try {
        const response = await axios.post('contact', contact)
        return response.data
      } catch (error) {
        throw error
      }
    },
  },
  visit:{
     get: async () => {
      try {
        const response = await axios.get<{ message: string; totalVisits: number }>('visits')
        return response.data
      } catch (error) {
        throw error
      }
    },
  }
}

export default api
