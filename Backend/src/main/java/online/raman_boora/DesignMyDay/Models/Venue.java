package online.raman_boora.DesignMyDay.Models;

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
@Document(collection = "venues")
public class Venue {

    @Id
    private String venueId;

    private String venueName;

    private String venueAddress;

    private double venuePrice;

    @DBRef
    private List<Images> images = new ArrayList<>();

    @DBRef
    private List<Service> services = new ArrayList<>();

    public List<Images> getImages() {
        return images != null ? images : new ArrayList<>();
    }

    public void setImages(List<Images> images) {
        this.images = images != null ? images : new ArrayList<>();
    }

    public List<Service> getServices() {
        return services != null ? services : new ArrayList<>();
    }

    public void setServices(List<Service> services) {
        this.services = services != null ? services : new ArrayList<>();
    }
}