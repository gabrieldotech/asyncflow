import { FastifyInstance } from "fastify";
import { Channel } from "amqplib";
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

export async function videoRoutes(
  app: FastifyInstance,
  { channel }: { channel: Channel },
) {
  const QUEUE_NAME = "pedidos_video";

  const convertVideoSchema = z.object({
    videoName: z.string({ message: "videoName must be a string" })
      .min(1, "videoName is required and cannot be empty"),
  });
  app.post("/convert", async (request, reply) => {
    const { videoName } = convertVideoSchema.parse(request.body)

    const message = {
      id: uuidv4(),
      videoName,
      status: "PENDING",
    };

    // publish the message to the queue
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    return reply
      .status(200)
      .send({ message: "Task add to queue", id: message.id });
  });
}
