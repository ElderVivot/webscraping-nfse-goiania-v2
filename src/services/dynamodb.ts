import AWS from 'aws-sdk'
import { v4 as uuid } from 'uuid'

import { logger } from '@common/log'
import { AwsConfig } from '@config/dynamodb'
import { ISettingsGoiania } from '@scrapings/_interfaces'

const tableName = 'log-webscraping-nfs-xml-gyn'
AWS.config.update(AwsConfig)
const dynamoDb = new AWS.DynamoDB.DocumentClient()

export async function saveLogDynamo (dataToSave: ISettingsGoiania): Promise<void> {
    try {
        var params = {
            TableName: tableName,
            Item: {
                ...dataToSave,
                id: uuid(),
                tenant: process.env.TENANT,
                timeLog: new Date().toISOString(),
                timeLogNumber: new Date().getTime(),
                dateStartDown: new Date(dataToSave.dateStartDown).toISOString(),
                dateEndDown: new Date(dataToSave.dateEndDown).toISOString()
            }
        }
        await dynamoDb.put(params).promise()
    } catch (err) {
        logger.error({ error: err })
    }
}