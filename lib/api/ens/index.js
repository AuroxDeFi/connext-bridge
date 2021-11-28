import _ from 'lodash'

import { networks } from '../../menus'
import { getChainTx, getFromAddress } from '../../object/tx'
import { getRequestUrl } from '../../utils'

const api_name = 'ens'

const request = async (path, params) => {
  const res = await fetch(getRequestUrl(process.env.NEXT_PUBLIC_API_URL, path, { ...params, api_name }))
  return await res.json()
}

export const graphql = async params => {
  const path = ''
  return await request(path, params)
}

export const domains = async params => {
  const size = typeof params?.size === 'number' ? params.size : 1000
  if (typeof params?.size !== 'undefined') {
    delete params.size
  }

  const where = params?.where
  if (typeof params?.where !== 'undefined') {
    delete params.where
  }

  let skip = 0

  let data

  let hasMore = true

  while (hasMore) {
    const response = await graphql({ ...params, query: `
      {
        domains(skip: ${skip}, first: ${size}${where ? `, where: ${where}` : ''}) {
          id
          name
          labelName
          labelhash
          parent {
            id
            name
          }
          subdomains {
            id
            name
          }
          resolvedAddress {
            id
          }
          resolver {
            id
            address
            addr {
              id
            }
            texts
            coinTypes
          }
          ttl
          isMigrated
        }
      }
    ` })

    data = _.uniqBy(_.concat(data || [], response?.data?.domains?.map(domain => {
      return {
        ...domain,
      }
    })), 'id')

    hasMore = where && response?.data?.domains?.length === size

    if (hasMore) {
      skip += size
    }
  }

  return { data }
}