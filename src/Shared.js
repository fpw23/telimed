import _ from 'lodash'

export const componentGetCompareProps = (path, current, previous, defaultValue, transfrom) => {
    let cur = _.get(current, path, defaultValue)
    let pre = _.get(previous, path, defaultValue)
  
    if (_.isFunction(transfrom)) {
      cur = transfrom(_, cur)
      pre = transfrom(_, pre)
    }
  
    return {
      Current: cur,
      Previous: pre,
      HasChanged: cur !== pre
    }
  }