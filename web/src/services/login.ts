import request, {apiRequest, getApiRequest} from 'utils/request';
import { User } from './users';

export interface ILoginRequest {
    name: string;
    password: string;
}

export interface ILoginResult {
    /** 用户组详细 */
    loginResponse: ILoginResponse
}

export interface ILoginResponse {
    token: string
    name: string
    role: string
    user_id: string
    owner_id: string
}

export const doLogin = async (params: ILoginRequest) => {
    const response = await apiRequest<ILoginResult>({ action: '/auth/v1/user/login', data: params });
    return response.loginResponse;
};


export interface InitAdminUserParams {
    /** 用户组ID */
    name: string
    password: string
  }
  
  export async function initAdminUser(params: InitAdminUserParams) {
    const result = await apiRequest<any>({ action: '/maintain/v1/mainuser/create', data: params })
    return result
  }
  
  /* 查询治理中心用户组详细 */
  export type DescribeAdminUserResult = {
    /** 用户组详细 */
    user: User
  }
  
  export async function checkExistAdminUser() {
    const result = await getApiRequest<DescribeAdminUserResult>({ action: '/maintain/v1/mainuser/exist' })
    return result
  }