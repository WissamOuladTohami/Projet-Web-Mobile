package com.fleet.driver;

import com.google.gson.annotations.SerializedName;

public class Vehicle {
    public int id;
    public String plate;
    public String brand;
    public String model;
    public String status;

    @SerializedName("driver_id")
    public int driverId;

    @SerializedName("driver_name")
    public String driverName;
}