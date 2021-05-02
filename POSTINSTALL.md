
### Post-installation configuration

You'll need to create a [Log sink](https://cloud.google.com/logging/docs/export/) to send a message to the extension's Pub/Sub topic (`${param:EXT_INSTANCE_ID}`) when the events data from Google Analytics for Firebase is exported to the BigQuery.

> Important: Make sure you're signed in with the **Project owner** account.

1. Navigate to the [Logs Router](https://console.cloud.google.com/logs/exports?project=${param:PROJECT_ID}) menu from the Google Cloud console.
2. Click the **CREATE SINK** button.
3. From the **Select sink service** dialog, select **Cloud Pub/Sub**.
4. You'll see the text filed where you can enter the label or text for search. Click the arrow located at the right end of the text field, and click **Convert to advanced filter**.
5. Configure the filter as follows:
```
resource.type="bigquery_dataset"
severity=NOTICE
protoPayload.methodName="google.cloud.bigquery.v2.JobService.InsertJob"
protoPayload.resourceName : "datasets/${param:DATASET_ID}/tables/events_"
```
6. Configure the sink details as follows:
* Sink Name: **${param:EXT_INSTANCE_ID}**
* Sink Service: **Pub/Sub**
* Sink Destination: **${param:EXT_INSTANCE_ID}**

6. Click **Create Sink** button. It will take a few seconds to create the sink. You'll see the 'Sink created' dialog once it completes.

### Using the extension

After you complete the post-installation configuration above, the extension will create a new table(`${param:TABLE_ID}_YYYYMMDD`) under the dataset `${param:DATASET_ID}`. 

The table stores data specific to virtual currency events, which is required in the Data Studio reports for data visualization.

### Monitoring

As a best practice, you can [monitor the activity](https://firebase.google.com/docs/extensions/manage-installed-extensions#monitor) of your installed extension, including checks on its health, usage, and logs.