package com.fleet.driver;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Handler;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.socket.client.IO;
import io.socket.client.Socket;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity {

    private TextView tvName, tvPlate, tvVehicleInfo, tvStatus, tvGpsStatus, tvLatitude, tvLongitude;
    private Button btnMission, btnFuel, btnLogout;

    private SessionManager session;
    private FusedLocationProviderClient fusedLocationClient;
    private Handler gpsHandler = new Handler();

    private boolean missionActive = false;
    private int vehicleId = -1;

    private static final int GPS_INTERVAL = 5000; // 🔥 5s for testing live

    private Socket socket;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        session = new SessionManager(this);
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        tvName = findViewById(R.id.tvName);
        tvPlate = findViewById(R.id.tvPlate);
        tvVehicleInfo = findViewById(R.id.tvVehicleInfo);
        tvStatus = findViewById(R.id.tvStatus);
        tvGpsStatus = findViewById(R.id.tvGpsStatus);
        tvLatitude = findViewById(R.id.tvLatitude);
        tvLongitude = findViewById(R.id.tvLongitude);
        btnMission = findViewById(R.id.btnMission);
        btnFuel = findViewById(R.id.btnFuel);
        btnLogout = findViewById(R.id.btnLogout);

        tvName.setText(session.getUserName());

        loadVehicle();

        initSocket(); // 🔥 IMPORTANT

        btnMission.setOnClickListener(v -> toggleMission());

        btnFuel.setOnClickListener(v ->
                startActivity(new Intent(this, FuelActivity.class))
        );

        btnLogout.setOnClickListener(v -> {
            stopGps();
            session.logout();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });

        requestLocationPermission();
    }

    // 🔌 SOCKET INIT
    private void initSocket() {
        try {
            socket = IO.socket("http://10.0.2.2:3000"); // emulator
            socket.connect();

            socket.on(Socket.EVENT_CONNECT, args ->
                    runOnUiThread(() -> tvGpsStatus.setText("Socket connecté ✓"))
            );

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void loadVehicle() {
        int driverId = session.getUserId();

        ApiClient.getService().getVehicles().enqueue(new Callback<List<Vehicle>>() {
            @Override
            public void onResponse(Call<List<Vehicle>> call, Response<List<Vehicle>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    for (Vehicle v : response.body()) {
                        if (v.driverId == driverId) {
                            vehicleId = v.id;
                            session.saveVehicleId(vehicleId);

                            runOnUiThread(() -> {
                                tvPlate.setText(v.plate);
                                tvVehicleInfo.setText(v.brand + " " + v.model);
                            });
                            break;
                        }
                    }
                }
            }

            @Override
            public void onFailure(Call<List<Vehicle>> call, Throwable t) {}
        });
    }

    private void toggleMission() {
        missionActive = !missionActive;

        if (missionActive) {
            startGps();
            btnMission.setText("STOP MISSION");
            tvStatus.setText("ACTIVE");
        } else {
            stopGps();
            btnMission.setText("START MISSION");
            tvStatus.setText("OFFLINE");
        }
    }

    // 🔁 GPS LOOP
    private Runnable gpsRunnable = new Runnable() {
        @Override
        public void run() {
            sendLocation();
            gpsHandler.postDelayed(this, GPS_INTERVAL);
        }
    };

    private void startGps() {
        gpsHandler.post(gpsRunnable);
    }

    private void stopGps() {
        gpsHandler.removeCallbacks(gpsRunnable);
    }

    // 📍 SEND LOCATION
    private void sendLocation() {
        if (ActivityCompat.checkSelfPermission(this,
                Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED)
            return;

        fusedLocationClient.getLastLocation()
                .addOnSuccessListener(location -> {
                    if (location != null && vehicleId != -1) {

                        double lat = location.getLatitude();
                        double lng = location.getLongitude();

                        runOnUiThread(() -> {
                            tvLatitude.setText(String.valueOf(lat));
                            tvLongitude.setText(String.valueOf(lng));
                        });

                        Map<String, Object> body = new HashMap<>();
                        body.put("vehicle_id", vehicleId);
                        body.put("latitude", lat);
                        body.put("longitude", lng);

                        // REST API
                        ApiClient.getService().sendPosition(body).enqueue(new Callback<Void>() {
                            @Override
                            public void onResponse(Call<Void> call, Response<Void> response) {
                                tvGpsStatus.setText("GPS envoyé ✓");
                            }

                            @Override
                            public void onFailure(Call<Void> call, Throwable t) {
                                tvGpsStatus.setText("Erreur GPS");
                            }
                        });

                        // 🔥 OPTIONAL REALTIME SOCKET (VERY IMPORTANT)
                        if (socket != null && socket.connected()) {
                            socket.emit("gps-update", body);
                        }
                    }
                });
    }

    private void requestLocationPermission() {
        if (ActivityCompat.checkSelfPermission(this,
                Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {

            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    100);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopGps();
        if (socket != null) socket.disconnect();
    }
}