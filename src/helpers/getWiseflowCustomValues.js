// CUSTOM WISEFLOW VALUES
import getCustomData from 'src/apis/getCustomData';
import ShareTypes from 'src/constants/shareTypes';

/**
 * @typedef {Object} WiseflowCustomValues
 * @property {string} defaultShareType (default: ShareTypes.NONE)
 * @property {boolean} showShareType (default: true)
 */

/**
 * @returns {WiseflowCustomValues}
 * @returns {string} defaultShareType (default: ShareTypes.NONE)
 * @returns {boolean} showShareType (default: true)
 * @returns {string[]} sharingPermissions (default: [])
 */
const getWiseflowCustomValues = () => {
  return {
    // Defaults
    defaultShareType: ShareTypes.NONE,
    showShareType: true,
    sharingPermissions: ['NONE', 'PARTICIPANTS', 'ASSESSORS', 'ALL'],
    ...JSON.parse(getCustomData()),
  };
};

export default getWiseflowCustomValues;
