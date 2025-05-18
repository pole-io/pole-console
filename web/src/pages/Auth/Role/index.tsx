import React, { } from 'react';
import RoleTable from './RoleTable';

import { useAppDispatch, useAppSelector } from 'modules/store';

export default React.memo(() => {

    return (
        <>
           <RoleTable type="custom"  />
        </>
    )
});