import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(dynamoClient);

const TABLE = process.env.COURSES_TABLE || "devsite_courses";

export const handler = async (event) => {
    try {
        const localeParam = event?.queryStringParameters?.locale;
        const locale = localeParam === "en" ? "en" : "es";

        const command = new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: "#locale = :locale",
            // FilterExpression: "#status = :status",
            ExpressionAttributeNames: {
                "#locale": "locale",
                // "#status": "status",
            },
            ExpressionAttributeValues: {
                ":locale": locale,
                // ":status": "in_progress",
            },
        });

        const result = await ddb.send(command);
        const items = result.Items ?? [];

        const courses = items.map((item) => ({
            course_id: item.course_id,
            course_url: item.course_url,
            duration: item.duration,
            has_certificate: item.has_certificate,
            image_url: item.image_url,
            institution: item.institution,
            progress_percentage: item.progress_percentage,
            status: item.status,
            tags: item.tags,
            title: item.title,
            year: item.year
        }));

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(courses),
        };
    } catch (err) {
        console.error("Error querying devsite_courses:", err);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: "Error retrieving courses in progress",
            }),
        };
    }
};
