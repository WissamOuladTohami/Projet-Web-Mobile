package com.fleet.driver;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import java.util.HashMap;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class FuelActivity extends AppCompatActivity {

    private EditText etQuantity, etNote;
    private Button btnSubmit, btnCancel;
    private TextView tvError;
    private SessionManager session;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_fuel);

        session = new SessionManager(this);

        etQuantity = findViewById(R.id.etQuantity);
        etNote = findViewById(R.id.etNote);
        btnSubmit = findViewById(R.id.btnSubmitFuel);
        btnCancel = findViewById(R.id.btnCancelFuel);
        tvError = findViewById(R.id.tvFuelError);

        btnSubmit.setOnClickListener(v -> submitFuel());
        btnCancel.setOnClickListener(v -> finish());
    }

    private void submitFuel() {
        String quantityStr = etQuantity.getText().toString().trim();
        String note = etNote.getText().toString().trim();

        if (quantityStr.isEmpty()) {
            tvError.setText("Veuillez entrer une quantité");
            tvError.setVisibility(View.VISIBLE);
            return;
        }

        double quantity;
        try {
            quantity = Double.parseDouble(quantityStr);
            if (quantity <= 0) throw new NumberFormatException();
        } catch (NumberFormatException e) {
            tvError.setText("Quantité invalide");
            tvError.setVisibility(View.VISIBLE);
            return;
        }

        int vehicleId = session.getVehicleId();
        if (vehicleId == -1) {
            tvError.setText("Aucun véhicule affecté");
            tvError.setVisibility(View.VISIBLE);
            return;
        }

        btnSubmit.setEnabled(false);
        btnSubmit.setText("Envoi...");
        tvError.setVisibility(View.GONE);

        Map<String, Object> body = new HashMap<>();
        body.put("vehicle_id", vehicleId);
        body.put("driver_id", session.getUserId());
        body.put("quantity", quantity);
        if (!note.isEmpty()) body.put("note", note);

        ApiClient.getService().addFuelLog(body).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    finish();
                } else {
                    runOnUiThread(() -> {
                        btnSubmit.setEnabled(true);
                        btnSubmit.setText("ENREGISTRER");
                        tvError.setText("Erreur lors de l'enregistrement");
                        tvError.setVisibility(View.VISIBLE);
                    });
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                runOnUiThread(() -> {
                    btnSubmit.setEnabled(true);
                    btnSubmit.setText("ENREGISTRER");
                    tvError.setText("Erreur réseau : " + t.getMessage());
                    tvError.setVisibility(View.VISIBLE);
                });
            }
        });
    }
}