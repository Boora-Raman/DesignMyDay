package online.raman_boora.DesignMyDay.Models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "vendors")
public class Vendor {
    @Id
    private String vendorId; // Changed to vendorId for consistency with frontend

    @NotBlank
    private String vendorName; // Changed to vendorName to match frontend

    @NotEmpty
    private List<String> vendorSpecialties = new ArrayList<>(); // Changed to vendorSpecialties

    private String description;

    @NotNull
    private Double price;

    @NotBlank
    private String vendorContact; // Added vendorContact field

    @DBRef
    private List<Images> images = new ArrayList<>();

    public List<Images> getImages() {
        return images != null ? images : new ArrayList<>();
    }

    public void setImages(List<Images> images) {
        this.images = images != null ? images : new ArrayList<>();
    }
}