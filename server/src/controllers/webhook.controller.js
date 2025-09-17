const { Webhook } = require('svix');
const { userModel } = require("../models/user");

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
if (!webhookSecret) {
  throw new Error("CLERK_WEBHOOK_SECRET is not set in the environment.");
}

module.exports.clerkWebhook = async (req, res) => {
  const payload = req.body;
  const headers = req.headers;

  const wh = new Webhook(webhookSecret);
  let evt;

  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    console.error("Error verifying webhook:", err.message);
    return res.status(400).send("Error occurred: Invalid signature");
  }

  const { id } = evt.data;
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created':
      case 'user.updated':
        const { first_name, last_name, email_addresses, image_url, primary_email_address_id } = evt.data;
        const primaryEmail = email_addresses.find(email => email.id === primary_email_address_id);
        
        if (!primaryEmail) {
          console.warn(`User ${id} has no primary email address.`);
          return res.status(400).send("User has no primary email address.");
        }

        await userModel.findOneAndUpdate(
          { clerkId: id },
          {
            $set: {
              name: `${first_name} ${last_name}`.trim(),
              email: primaryEmail.email_address,
              avatar: image_url,
            },
          },
          { upsert: true, new: true }
        );
        console.log(`User ${id} was ${eventType === 'user.created' ? 'created' : 'updated'}.`);
        break;

      case 'user.deleted':
        const deletedUser = await userModel.findOneAndDelete({ clerkId: id });
        if (deletedUser) {
          console.log(`User ${id} was deleted.`);
        } else {
          console.warn(`Attempted to delete non-existent user ${id}.`);
        }
        break;
    }

    res.status(200).send("Webhook processed successfully.");
  } catch (err) {
    console.error("Error processing webhook event:", err);
    res.status(500).send("Internal Server Error");
  }
};