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
@Document(collection = "carters")
public class Carter {
    @Id
    private String carterId; // Changed from id to carterId

    @NotBlank
    private String carterName; // Changed from name to carterName

    @NotEmpty
    private List<String> carterSpecialties = new ArrayList<>(); // Changed from specialties to carterSpecialties

    private String description;

    @NotNull
    private Double price;

    @NotBlank
    private String carterContact; // Added carterContact field

    @DBRef
    private List<Images> images = new ArrayList<>();

    public List<Images> getImages() {
        return images != null ? images : new ArrayList<>();
    }

    public void setImages(List<Images> images) {
        this.images = images != null ? images : new ArrayList<>();
    }
}