package online.raman_boora.DesignMyDay.Models;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "bookings")
public class Booking {
    @Id
    private String bookingId;

    @DBRef
    @NotNull
    private Venue venue;

    @DBRef
    private List<Vendor> vendors = new ArrayList<>();

    @DBRef
    private List<Carter> carters = new ArrayList<>();

    @NotNull
    private Date bookingDate;

    private String status;

    private Double totalPrice;

    public List<Vendor> getVendors() {
        return vendors != null ? vendors : new ArrayList<>();
    }

    public void setVendors(List<Vendor> vendors) {
        this.vendors = vendors != null ? vendors : new ArrayList<>();
    }

    public List<Carter> getCarters() {
        return carters != null ? carters : new ArrayList<>();
    }

    public void setCarters(List<Carter> carters) {
        this.carters = carters != null ? carters : new ArrayList<>();
    }
}