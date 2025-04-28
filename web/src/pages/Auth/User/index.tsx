import React, { } from 'react';
import { Tabs } from 'tdesign-react';
import TabPanel from 'tdesign-react/es/tabs/TabPanel';

import UserTable from './users';
import GroupsTable from './group';

export default React.memo(() => {

    return (
        <>
            <Tabs>
                <TabPanel label="用户" value="1">
                    <div
                        style={{
                            margin: 20
                        }}
                    >
                      <UserTable />
                    </div>
                </TabPanel>
                <TabPanel label="用户组" value="2">
                    <div
                        style={{
                            margin: 20
                        }}
                    >
                      <GroupsTable />
                    </div>
                </TabPanel>
            </Tabs>
        </>
    )
});