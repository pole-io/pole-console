import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import proxy from '../configs/host';
import { v4 as uuidv4 } from 'uuid';

const env = import.meta.env.MODE || 'development';
const API_HOST = proxy[env].API;

const TIMEOUT = 5000;


export const instance = axios.create({
  baseURL: API_HOST,
  timeout: TIMEOUT,
  withCredentials: true,
});

// instance.interceptors.response.use(
//   // eslint-disable-next-line consistent-return
//   (response) => {
//     if (response.status === 200) {
//       return response;
//     }
//     return Promise.reject(response?.data.info);
//   },
//   (e) => Promise.reject(e),
// );

export default instance;


export interface APIRequestOption {
  action: string
  data?: any
  opts?: AxiosRequestConfig
}
export interface ApiResponse {
  code: number
  info: string
}
export const SuccessCode = 299999
export const TokenNotExistCode = 407

const handleTokenNotExist = () => {
}

export async function apiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options
  try {
    const res = (await instance
      .post<T & ApiResponse>(action, data, {
        ...opts,
        headers: {
          'Authorization': window.localStorage.getItem('polaris_token'),
          'X-Polaris-User': window.localStorage.getItem('login-user-id'),
          'X-Request-Id': uuidv4(),
          ...(opts?.headers ?? {}),
        },
      })
      .catch(function (error) {
        if (error.response.status === TokenNotExistCode) {
          handleTokenNotExist()
        }
        if (error.response) {
          if (error.response?.data?.code === TokenNotExistCode) {
            handleTokenNotExist()
          }
        }
        if (error.response?.data) {
          throw new Error(error.response?.data?.info)
        }
        throw error;
      })) as AxiosResponse<T & ApiResponse>

    return res.data
  } catch (e) {
    throw e
  }
}

export async function getApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options
  try {
    const res = (await axios
      .get<T & ApiResponse>(action, {
        params: data,
        ...opts,
        headers: {
          'Authorization': window.localStorage.getItem('polaris_token'),
          'X-Polaris-User': window.localStorage.getItem('login-user-id'),
          'X-Request-Id': uuidv4(),
        },
      })
      .catch(function (error) {
        if (error.response.status === TokenNotExistCode) {
          handleTokenNotExist()
        }
        if (error.response) {
          if (error.response?.data?.code === TokenNotExistCode) {
            handleTokenNotExist()
          }
        }
        if (error.response?.data) {
          throw new Error(error.response?.data?.info)
        }
        throw error;
      })) as AxiosResponse<T & ApiResponse>

    return res.data
  } catch (e) {
    throw e
  }
}

export async function putApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options
  try {
    const res = (await axios
      .put<T & ApiResponse>(action, data, {
        ...opts,
        headers: {
          'Authorization': window.localStorage.getItem('polaris_token'),
          'X-Polaris-User': window.localStorage.getItem('login-user-id'),
          'X-Request-Id': uuidv4(),
        },
      })
      .catch(function (error) {
        console.log('error', error)
        if (error.response.status === TokenNotExistCode) {
          handleTokenNotExist()
        }
        if (error.response) {
          if (error.response?.data?.code === TokenNotExistCode) {
            handleTokenNotExist()
          }
        }
        if (error.response?.data) {
          throw new Error(error.response?.data?.info)
        }
        throw error;
      })) as AxiosResponse<T & ApiResponse>

    return res.data
  } catch (e) {
    throw e
  }
}

export async function deleteApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options
  try {
    const res = (await axios
      .delete<T & ApiResponse>(action, {
        params: data,
        ...opts,
        headers: {
          'Authorization': window.localStorage.getItem('polaris_token'),
          'X-Polaris-User': window.localStorage.getItem('login-user-id'),
          'X-Request-Id': uuidv4(),
        },
      })
      .catch(function (error) {
        if (error.response.status === TokenNotExistCode) {
          handleTokenNotExist()
        }
        if (error.response) {
          if (error.response?.data?.code === TokenNotExistCode) {
            handleTokenNotExist()
          }
        }
        if (error.response?.data) {
          throw new Error(error.response?.data?.info)
        }
        throw error;
      })) as AxiosResponse<T & ApiResponse>

    return res.data
  } catch (e) {
    throw e
  }
}

export interface FetchAllOptions {
  listKey?: string
  totalKey?: string
  limitKey?: string
  offsetKey?: string
}

const DefaultOptions = {
  listKey: 'list',
  totalKey: 'totalCount',
  limitKey: 'limit',
  offsetKey: 'offset',
}

/**
 * 获取所有的列表
 * @param fetchFun 模板函数需要支持pageNo,pageSize参数
 * @param listKey 返回结果中列表的键名称 默认list
 */
export function getAllList(fetchFun: (params?: any) => Promise<any>, options: FetchAllOptions = {}) {
  return async function (params: any) {
    const fetchOptions = { ...DefaultOptions, ...options }
    let allList: any[] = [],
      pageNo = 0
    const pageSize = 50
    while (true) {
      // 每次获取获取50条
      params = { ...params }

      const result = await fetchFun({
        ...params,
        [fetchOptions.offsetKey]: pageNo * pageSize,
        [fetchOptions.limitKey]: pageSize,
      } as any)

      allList = allList.concat(result[fetchOptions.listKey])

      if (allList.length >= result[fetchOptions.totalKey]) {
        // 返回
        break
      } else {
        pageNo++
      }
    }
    return {
      list: allList,
      totalCount: allList.length,
    }
  }
}
