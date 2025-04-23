import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Popup, Badge, Dropdown, Space } from 'tdesign-react';
import {
  Icon,
  LogoGithubIcon,
  MailIcon,
  HelpCircleIcon,
  SettingIcon,
  PoweroffIcon,
  UserCircleIcon,
} from 'tdesign-icons-react';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { toggleSetting } from 'modules/global';
import { logout } from 'modules/user';
import Style from './HeaderIcon.module.less';

const { DropdownMenu, DropdownItem } = Dropdown;

export default memo(() => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userInfo = useAppSelector((state) => state.user.currentUser);

  const gotoWiki = () => {
    window.open('https://tdesign.tencent.com/react/overview');
  };

  const clickHandler = (data: any) => {
    if (data.value === 1) {
      navigate('/dashboard');
    }
  };
  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <Space align='center'>
      <Popup content='帮助文档' placement='bottom' showArrow destroyOnClose>
        <Button
          className={Style.menuIcon}
          shape='square'
          size='large'
          variant='text'
          onClick={gotoWiki}
          icon={<HelpCircleIcon />}
        />
      </Popup>
      <Dropdown trigger={'click'} onClick={clickHandler}>
        <Button variant='text' className={Style.dropdown}>
          <Icon name='user-circle' className={Style.icon} />
          <span className={Style.text}>{userInfo.name}</span>
          <Icon name='chevron-down' className={Style.icon} />
        </Button>
        <DropdownMenu>
          <DropdownItem value={1}>
            <div className={Style.dropItem}>
              <UserCircleIcon />
              <span>个人中心</span>
            </div>
          </DropdownItem>
          <DropdownItem value={1} onClick={handleLogout}>
            <div className={Style.dropItem}>
              <PoweroffIcon />
              <span>退出登录</span>
            </div>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Popup content='页面设置' placement='bottom' showArrow destroyOnClose>
        <Button
          className={Style.menuIcon}
          shape='square'
          size='large'
          variant='text'
          onClick={() => dispatch(toggleSetting())}
          icon={<SettingIcon />}
        />
      </Popup>
    </Space>
  );
});
