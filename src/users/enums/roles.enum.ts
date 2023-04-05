export enum RolesEnum {
    SUPER_ADMIN = 'SUPER_ADMIN',
    EDITOR = 'EDITOR',
    READER = 'READER',
    MANAGER = 'MANAGER',
    TEACHER = 'TEACHER',
}

export const RoleGroups = {
    ADMINSTRATION: [RolesEnum.SUPER_ADMIN],
    REGISTRATION: [RolesEnum.EDITOR, RolesEnum.READER, RolesEnum.TEACHER],
    NEWSPAPER_MANAGER: [ RolesEnum.MANAGER],
    NEWSPAPER: [RolesEnum.EDITOR , RolesEnum.MANAGER, RolesEnum.TEACHER],
    NEWSPAPER_PROFILE: [RolesEnum.EDITOR ,RolesEnum.TEACHER],  
}  

