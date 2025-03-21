import axios from "axios";


// ? const AUTH_TOKEN: string = import.meta.env.VITE_AUTH_TOKEN as string

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    // headers: {'Authorization': AUTH_TOKEN }
});

// ! Request interceptor

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if(token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error: any) => {
        return Promise.reject(error)
    }
);

// ! Response interceptor (optional, but useful for handling token expiration)

api.interceptors.response.use(
    (response: any) => response,
    async (error) => {
        const originalRequest = error.config;

        // ? if the token had expired
        if(error.response.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;
            
            try{
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post('http://localhost:4000/refresh-token', {
                    refreshToken
                });

                const { token } = response.data;

                localStorage.setItem('token', token);

                originalRequest.headers['Authorization'] = `Bearer ${token}`;

                return api(originalRequest)
            }catch(refreshError){
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            }
        }

    return Promise.reject(error)
    }
)


const auth = axios.create({
    baseURL: 'http://localhost:3000/auth',
});


export { api, auth };