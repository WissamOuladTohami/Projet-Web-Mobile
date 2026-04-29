package com.fleet.driver;

import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.http.*;

public interface ApiService {

    // Auth
    @POST("auth/login")
    Call<LoginResponse> login(@Body Map<String, String> body);

    // Vehicle
    @GET("vehicles/{id}")
    Call<Vehicle> getVehicle(@Path("id") int id);

    @GET("vehicles")
    Call<List<Vehicle>> getVehicles();

    @PUT("vehicles/{id}")
    Call<Void> updateVehicle(@Path("id") int id, @Body Map<String, String> body);

    // Position
    @POST("positions")
    Call<Void> sendPosition(@Body Map<String, Object> body);

    // Fuel
    @POST("fuel-logs")
    Call<Void> addFuelLog(@Body Map<String, Object> body);
}