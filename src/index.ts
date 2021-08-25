import { IPackageConfig } from '@overtheairbrew/homebrew-plugin';
import { PidLogic } from './pid-logic';

const OtaPlugin: IPackageConfig = {
  logics: [PidLogic],
};

export default OtaPlugin;
