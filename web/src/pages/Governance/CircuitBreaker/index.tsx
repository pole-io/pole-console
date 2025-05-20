import React, { } from 'react';
import { Tabs } from 'tdesign-react';
import TabPanel from 'tdesign-react/es/tabs/TabPanel';

export default React.memo(() => {

    return (
        <>
            <Tabs>
                <TabPanel label="服务熔断" value="1">
                    <div
                        style={{
                            margin: 20
                        }}
                    >
                    </div>
                </TabPanel>
                <TabPanel label="接口熔断" value="2">
                    <div
                        style={{
                            margin: 20
                        }}
                    >
                    </div>
                </TabPanel>
                <TabPanel label="实例熔断" value="3">
                    <div
                        style={{
                            margin: 20
                        }}
                    >
                    </div>
                </TabPanel>
                <TabPanel label="故障探测" value="4">
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