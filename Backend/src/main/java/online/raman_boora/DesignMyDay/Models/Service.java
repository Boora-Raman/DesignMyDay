package online.raman_boora.DesignMyDay.Models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "services")
public class Service {

    @Id
    private String serviceId;

    private String serviceName;

    private double servicePrice;

    private String serviceDescription;
}