import React, { } from 'react';
import { Tabs } from 'tdesign-react';
import TabPanel from 'tdesign-react/es/tabs/TabPanel';


export default React.memo(() => {

    return (
        <>
            <Tabs>
                <TabPanel label="自定义路由" value="1">
                    <div
                        style={{
                            margin: 20
                        }}
                    >
                    </div>
                </TabPanel>
                <TabPanel label="就近路由" value="2">
                    <div
                        style={{
                            margin: 20
                        }}
                    >
                    </div>
                </TabPanel>
                <TabPanel label="泳道" value="3">
                    <div
                        style={{
                            margin: 20
                        }}
                    >
                    </div>
                </TabPanel>
            </Tabs>
        </>
    )
});