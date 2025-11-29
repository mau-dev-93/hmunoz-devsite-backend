import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({});
const BUCKET = process.env.CONTENT_BUCKET;
const PREFIX = process.env.CONTENT_PREFIX ?? "";

export const handler = async (event) => {
    try {
        let payload = {};

        if (event?.body) {
            try {
                payload = JSON.parse(event.body);
            } catch (e) {
                console.error("Invalid JSON body for /projects", e);
            }
        }

        const localeParam =
            payload.locale || event?.queryStringParameters?.locale;

        const locale = localeParam === "en" ? "en" : "es";

        const key = `${PREFIX}v1/projects/${locale}.json`;

        const resp = await s3.send(
            new GetObjectCommand({
                Bucket: BUCKET,
                Key: key,
            })
        );

        const body = await resp.Body.transformToString();
        const projects = JSON.parse(body);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ data: projects }),
        };
    } catch (err) {
        console.error("Error getting projects:", err);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ message: "Error retrieving projects" }),
        };
    }
};