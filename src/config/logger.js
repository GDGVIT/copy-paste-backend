const getTimeStamp = () => {
  const date = new Date()
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

const info = (namespace, message, object) => {
  if (object) {
    console.log(`[${getTimeStamp()}] [${namespace}] [INFO] ${message}`, object)
  } else {
    console.log(`[${getTimeStamp()}] [${namespace}] [INFO] ${message}`)
  }
}

const warn = (namespace, message, object) => {
  if (object) {
    console.warn(`[${getTimeStamp()}] [${namespace}] [WARN] ${message}`, object)
  } else {
    console.warn(`[${getTimeStamp()}] [${namespace}] [WARN] ${message}`)
  }
}

const error = (namespace, message, object) => {
  if (object) {
    console.error(`[${getTimeStamp()}] [${namespace}] [ERROR] ${message}`, object)
  } else {
    console.error(`[${getTimeStamp()}] [${namespace}] [ERROR] ${message}`)
  }
}

const debug = (namespace, message, object) => {
  if (object) {
    console.debug(`[${getTimeStamp()}] [${namespace}] [DEBUG] ${message}`, object)
  } else {
    console.debug(`[${getTimeStamp()}] [${namespace}] [DEBUG] ${message}`)
  }
}

module.exports = {
  info,
  warn,
  error,
  debug
}
