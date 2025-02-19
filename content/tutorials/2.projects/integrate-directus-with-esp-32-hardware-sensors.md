---
id: f6bf9070-0fb6-4cc0-ba6d-99e1b83e2b87
slug: integrate-directus-with-esp-32-hardware-sensors
title: Integrate Directus with ESP32 Hardware Sensors
authors:
  - name: Osinachi Chukwujama
    title: Guest Author
description: Learn how to integrate Directus with IoT systems by reading and publishing sensor data.
---
Internet of Things (IoT) systems often need to log their collected data. In this tutorial, you will build a temperature logging system using a DHT22 as a temperature and humidity module, and an ESP32 microcontroller board with onboard WiFi for connecting to a Directus project.

## Before You Start

You will need:

- A Directus project - [follow our quickstart guide](/getting-started/overview) if you don't already have one.
- Either the list of physical components below, or a [A Wowki Club account](https://wokwi.com/club) that will allow you to simulate the hardware.

### Components List

- An [ESP32](https://www.espressif.com/en/products/socs/esp32) development board.
- A [DHT22 sensor](https://www.adafruit.com/product/385).
- A Type B Micro USB cable.
- Three male to female jumper cables (may be optional, depending on the configuration of your DHT22).

You will also need to install the [Arduino IDE](https://www.arduino.cc/en/software) and have ESP32 board support. Follow the official [Espressif documentation](https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html) to install it in the IDE.

### Installing DHT22 Sensor Library

Since you will program your ESP32 using the Arduino IDE, you must install the [DHT sensor library by Adafruit](https://www.arduino.cc/reference/en/libraries/dht-sensor-library/). Search for the "DHT Sensor Library" in your library manager and install the corresponding library authored by Adafruit. Use the image below as a reference.

![Installing the DHT22 sensor library](/img/a8b0217b-f6cf-47ea-9e21-359cb762bdc5.webp)

## Creating the `temperature_and_humidity` Collection

After setting up Directus, you must create the database table where your IoT data will be stored. Create a new `temperature_and_humidity` collection and enable the **Created On (date_created)** optional field.

Create the following additional fields:

- `temperature` - input interface - `float` type.
- `humidity` - input interface - `float` type.

## Creating a Directus Role and User

Create a new role called `esp32-writer` and give **All Access** to the `temperature_and_humidity` collection.

Create a new user in this role called "ESP32-Writer" and generate a static access token. Save this for later.

## Connecting the ESP32 and the DHT22 with Physical Components

A DHT22 sensor can connect directly to an ESP32 using three pins. DHT22 comes in two types, 3-pin type and 4-pin type. The 3-pin type doesn't require extra configuration. You connect ground to ground, VCC to 5V output, and data to a GPIO pin, say pin 13. For the 4-pin type, ignore the 3rd pin from the left and connect as shown in the image below:

![DHT22 to ESP32](/img/c76ad8a2-520e-45f5-95bf-599bcfb377e1.webp)

### Connecting the ESP32 Board to your Computer

You can see the values from the DHT22 sensor in the Arduino serial monitor. After connecting your ESP32 to your computer, choose a board and port that corresponds to your purchased board and available port on your computer.

![Board selector page](/img/edb74018-5fc4-46da-b69c-f892a2645082.webp)

If you are using the ESP32 Wroom 32D, choose the ESP 32 DA Module and the COM port that appears after you plug in the ESP32 to your computer via the USB cable.

![Selecting board and port](/img/7e81eed4-78a9-4065-8c8a-bb834d1858ed.webp)

## Logging temperature and humidity data to Serial

You can log the values from the DHT22 to the serial monitor by defining variables for the temperature and humidity and then initializing the DHT object. Within the setup function, you must initialize the Serial logging and intialize the connection to the DHT22 module.

Within the loop function, the sensor readings are obtained from the DHT22 and stored to the temperature and humidity variables. With all that done, these values can be logged to the serial monitor.

There's a delay of 5 seconds to ensure that the DHT22 can handle accurate readings as it has a low sampling rate. When sending your data to Directus, you will increase the delay to 30 seconds or greater. Your Serial Monitor baud rate must be set to 115200 for you to see the values being logged.

```cpp
#include <DHT.h>

float temperature, humidity;
DHT dht22_sensor(13, DHT22);

void setup() {
  Serial.begin(115200);
  dht22_sensor.begin();
}

void loop() {
  temperature = dht22_sensor.readTemperature();
  humidity = dht22_sensor.readHumidity();

  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print("°C <-> Humidity: ");
  Serial.print(humidity);
  Serial.println("%");

  delay(5000);
}
```
## Sending the temperature and humidity data to Directus
At this point, you have your ESP32 logging data to the Serial monitor. To send these to Directus, you have to introduce the HTTP and WiFi libraries to your project.
The WiFi library connects your ESP32 to the internet while the HTTP library turns your ESP32 into an HTTP agent that can make HTTP requests. The script below is the complete code for logging data to Directus - add it to the defaul file on your opened Arduino IDE:
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino.h>
#include <DHT.h>
const char* ssid = "<YOUR_WIFI_SSID>";
const char* password = "<YOUR_WIFI_PASSWORD>";
const char* directusToken = "Bearer <TOKEN>";
const char* directusEndpoint = "http://192.168.43.143:8055/items/temperature_and_humidity";
float temperature, humidity;
DHT dht22_sensor(13, DHT22);
HTTPClient http;
http.begin(directusEndpoint);
http.addHeader("Content-Type", "application/json");
http.addHeader("Authorization", directusToken);
void setup() {
  Serial.begin(115200);
  delay(1000);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("\nConnecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi");
  dht22_sensor.begin();
}
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Error in WiFi connection");
  }
  temperature = dht22_sensor.readTemperature();
  humidity = dht22_sensor.readHumidity();
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Error reading sensor data");
  }
  String jsonPayload = "{\"temperature\":" + String(temperature) + ",\"humidity\":" + String(humidity) + "}";
  Serial.println(jsonPayload);
  int httpResponseCode = http.POST(jsonPayload);
  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    String response = http.getString();
    Serial.println(response);
  } else {
    Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end();
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print("°C <-> Humidity: ");
  Serial.print(humidity);
  Serial.println("%");
 delay(30000);
}
```

### Breakdown of the script

The script consists of two sections: the setup and the logging loop. The setup section is where all variables are initialized while the logging loop contains code that reads the sensor values and sends them to the Directus cloud.

#### The setup section

For the script to work, you must set your WiFi SSID, WiFi password, and the Directus token from earlier. Your `directusEndpoint` variable might be different from this depending on where you run it. If you run Directus locally and you connect both the ESP32 and your local machine to your WiFi access point, then the IP address defined should be that of your machine on the network (possibly 192.168.43.143). If however you run Directus in the cloud, then change the IP address to the address of your Directus cloud instance.

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino.h>
#include <DHT.h>

const char* ssid = "<YOUR_WIFI_SSID>";
const char* password = "<YOUR_WIFI_PASSWORD>";
const char* directusToken = "Bearer <TOKEN>";
const char* directusEndpoint = "http://192.168.43.143:8055/items/temperature_and_humidity";

float temperature, humidity;
DHT dht22_sensor(13, DHT22);

HTTPClient http;
http.begin(directusEndpoint);
http.addHeader("Content-Type", "application/json");
http.addHeader("Authorization", directusToken);

void setup() {
  Serial.begin(115200);
  delay(1000);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("\nConnecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi");

  dht22_sensor.begin();
}
```
The part of this section that has the `setup()` function defined contains code for connecting to the WiFi access point and initialize the reading of the sensor data.
```cpp
void setup() {
 Serial.begin(115200);
 delay(1000);
 WiFi.mode(WIFI_STA);
 WiFi.begin(ssid, password);
 Serial.println("\nConnecting to WiFi");
 while (WiFi.status() != WL_CONNECTED) {
   delay(500);
   Serial.print(".");
 }
 Serial.println("Connected to WiFi");
 dht22_sensor.begin();
}
```

#### The logging loop

The logging loop consists of code that reads the sensor data, makes the HTTP POST request, and validates that the request was a success or error. There are three error handling logic to check that the WiFi is still connected, that the sensor readings are not malformed, and the HTTP request succeeded. The script has a 30-second delay to help the DHT22 sensor measure more accurately and prevent an overloading of the server.

```cpp
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Error in WiFi connection");
  }

  temperature = dht22_sensor.readTemperature();
  humidity = dht22_sensor.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Error reading sensor data");
  }

  String jsonPayload = "{\"temperature\":" + String(temperature) + ",\"humidity\":" + String(humidity) + "}";
  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    String response = http.getString();
    Serial.println(response);
  } else {
    Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();

  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print("°C <-> Humidity: ");
  Serial.print(humidity);
  Serial.println("%");

 delay(30000);
}
```

When you open your Directus content section, you will see the values logged so far. You can increase the delay to reduce the number of logs you get per hour. Currently, the rate is 2 logs per minute (1 log every 30 seconds), so 120 logs per hour. This may or may not work for you depending on your use case.

![Dashboard with logs](/img/15307d78-1632-4a5d-87d9-cb7f2a8ebaae.webp)

## Visualizing Data in Directus Insights

Directus Insights allows you to create multiple panels in a dashboard, powered by data in your project.

To show the change over time for temperature, create a bar chart with the following settings:

1. Collection - Temperature and Humidity
2. X-Axis - Date Created
3. Y-Axis - Temperature
4. Y-Axis Function - Max
5. Value Decimals - 2
6. Color - #E35168

You can repeat this for humidity, and any other data inside of your project.

![temperature and humidity trends over time](/img/a20044e9-3d4f-4e48-8750-84ba5552132b.webp)

## Summary

In this tutorial, you learned how to collect temperature and humidity data from a DHT22 sensor and log it to a Directus project. You also learned how to visualize how this data changes over time using Directus Insights.
