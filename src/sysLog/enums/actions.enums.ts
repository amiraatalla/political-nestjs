export enum ActionsEnum {
  /*
   *User
   */
  CREATE_USER = 'Create User',
  SEARCH_USER = 'Search User',
  GET_ME_USER = 'Get Me User',
  UPDATE_ME_USER = 'Update Me User',
  DELETE_ME_USER = 'Delete Me User',
  GET_USER = 'Get User',
  UPDATE_USER = 'Update User',
  DELETE_USER = 'Delete User',

  /*
   *User
   */
  CREATE_CUSTOMER = 'Create Customer',
  SEARCH_CUSTOMER = 'Search Customer',
  GET_ME_CUSTOMER = 'Get Me Customer',
  UPDATE_ME_CUSTOMER = 'Update Me Customer',
  DELETE_ME_CUSTOMER = 'Delete Me Customer',
  GET_CUSTOMER = 'Get Customer',
  UPDATE_CUSTOMER = 'Update Customer',
  DELETE_CUSTOMER = 'Delete Customer',

  /**
   * CATEGORY
   */

  CREATE_CATEGORY = 'CREATE_CATEGORY',
  UPDATE_CATEGORY = 'UPDATE_CATEGORY',
  GET_CATEGORY = 'GET_CATEGORY',

  /**
   * NEWSPAPER
   */

  CREATE_NEWSPAPER = 'CREATE_NEWSPAPER',
  UPDATE_NEWSPAPER = 'UPDATE_NEWSPAPER',
  GET_NEWSPAPER = 'GET_NEWSPAPER',

  /**
 * TUTORIAL
 */
  CREATE_TUTORIAL = 'CREATE_TUTORIAL',
  UPDATE_TUTORIAL = 'UPDATE_TUTORIAL',
  GET_TUTORIAL = 'GET_TUTORIAL',
  SEARCH_TUTORIAL = 'SEARCH_TUTORIAL',


  /**
* TUTORIAL
*/

  CREATE_CELEBRITIES = 'CREATE_CELEBRITIES',
  UPDATE_CELEBRITIES = 'UPDATE_CELEBRITIES',
  DELETE_CELEBRITIES = 'DELETE_CELEBRITIES',
  GET_CELEBRITIES = 'GET_CELEBRITIES',
  SEARCH_CELEBRITIES = 'SEARCH_CELEBRITIES',

  /**
   * CATEGORY
   */

  CREATE_NEWS = 'CREATE_NEWS',
  UPDATE_NEWS = 'UPDATE_NEWS',
  GET_NEWS = 'GET_NEWS',

  /**
   * OBJECTIVES
   */

  CREATE_OBJECTIVES = 'CREATE_OBJECTIVES',
  UPDATE_OBJECTIVES = 'UPDATE_OBJECTIVES',
  DELETE_OBJECTIVES = 'DELETE_OBJECTIVES',
  GET_OBJECTIVES = 'GET_OBJECTIVES',

  /**
   * OPPORTUNITY
   */

  CREATE_OPPORTUNITY = 'CREATE_OPPORTUNITY',
  GET_OPPORTUNITY = 'GET_OPPORTUNITY',
  UPDATE_OPPORTUNITY = 'UPDATE_OPPORTUNITY',
  DELETE_OPPORTUNITY = 'DELETE_OPPORTUNITY',

  /**
  * COMPLAINT
  */

  CREATE_COMPLAINT = 'CREATE_COMPLAINT',
  UPDATE_COMPLAINT = 'UPDATE_COMPLAINT',
  GET_COMPLAINT = 'GET_COMPLAINT',

  /**
* RUMORS
*/

  CREATE_RUMORS = 'CREATE_RUMORS',
  UPDATE_RUMORS = 'UPDATE_RUMORS',
  GET_RUMORS = 'GET_RUMORS',
  /**
  * OUTLETS
  */
  CREATE_OUTLETS = 'CREATE_OUTLETS',
  UPDATE_OUTLETS = 'UPDATE_OUTLETS',
  GET_OUTLETS = 'GET_OUTLETS',
  /*
   * Auth
   */
  SIGN_IN = 'Sign in',
  LOG_OUT = 'Log out',
  PROTECTED = 'Protected',
  //
  FAILED_SIGN_IN = 'Sign in Failed',
  UPDATE_IO4_ITEM_CODE = 'Update io4 Item Code',
  /*
     * logs
     */
  SEARCH_LOGS = 'Search logs',
  GET_LOG = 'Get log',
  DELETE_LOG = 'Delete log',
}

export const ActionsGroups = {
  USER: [
    ActionsEnum.CREATE_USER,
    ActionsEnum.SEARCH_USER,
    ActionsEnum.GET_ME_USER,
    ActionsEnum.UPDATE_ME_USER,
    ActionsEnum.DELETE_ME_USER,
    ActionsEnum.GET_USER,
    ActionsEnum.UPDATE_USER,
    ActionsEnum.DELETE_USER,
  ],
  CUSTOMER: [
    ActionsEnum.CREATE_CUSTOMER,
    ActionsEnum.SEARCH_CUSTOMER,
    ActionsEnum.GET_ME_CUSTOMER,
    ActionsEnum.UPDATE_ME_CUSTOMER,
    ActionsEnum.DELETE_ME_CUSTOMER,
    ActionsEnum.GET_CUSTOMER,
    ActionsEnum.UPDATE_CUSTOMER,
    ActionsEnum.DELETE_CUSTOMER,
  ],

  CATEGORY: [
    ActionsEnum.CREATE_CATEGORY,
    ActionsEnum.UPDATE_CATEGORY,
    ActionsEnum.GET_CATEGORY,
  ],

  NEWSPAPER: [
    ActionsEnum.CREATE_NEWSPAPER,
    ActionsEnum.UPDATE_NEWSPAPER,
    ActionsEnum.GET_NEWSPAPER,
  ],
  TUTORIAL: [
    ActionsEnum.CREATE_TUTORIAL,
    ActionsEnum.UPDATE_TUTORIAL,
    ActionsEnum.GET_TUTORIAL,
    ActionsEnum.SEARCH_TUTORIAL,
  ],
  CELEBRITIES: [
    ActionsEnum.CREATE_CELEBRITIES,
    ActionsEnum.UPDATE_CELEBRITIES,
    ActionsEnum.GET_CELEBRITIES,
    ActionsEnum.SEARCH_CELEBRITIES,
  ],
  NEWS: [
    ActionsEnum.CREATE_NEWS,
    ActionsEnum.UPDATE_NEWS,
    ActionsEnum.GET_NEWS,
  ],
  OBJECTIVES: [
    ActionsEnum.CREATE_OBJECTIVES,
    ActionsEnum.UPDATE_OBJECTIVES,
    ActionsEnum.DELETE_OBJECTIVES,
    ActionsEnum.GET_OBJECTIVES,
  ],
  OPPORTUNITY: [
    ActionsEnum.CREATE_OPPORTUNITY,
    ActionsEnum.UPDATE_OPPORTUNITY,
    ActionsEnum.DELETE_OPPORTUNITY,
    ActionsEnum.GET_OPPORTUNITY,
  ],
  COMPLAINT: [
    ActionsEnum.CREATE_COMPLAINT,
    ActionsEnum.UPDATE_COMPLAINT,
    ActionsEnum.GET_COMPLAINT,
  ],
  RUMORS: [
    ActionsEnum.CREATE_RUMORS,
    ActionsEnum.UPDATE_RUMORS,
    ActionsEnum.GET_RUMORS,
  ],
  OUTLETS: [
    ActionsEnum.CREATE_OUTLETS,
    ActionsEnum.UPDATE_OUTLETS,
    ActionsEnum.GET_OUTLETS,
  ],
  AUTH: [ActionsEnum.SIGN_IN, ActionsEnum.LOG_OUT, ActionsEnum.PROTECTED],
  LOGS: [ActionsEnum.SEARCH_LOGS, ActionsEnum.GET_LOG, ActionsEnum.DELETE_LOG],
};
