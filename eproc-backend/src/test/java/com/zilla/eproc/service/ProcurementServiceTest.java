package com.zilla.eproc.service;

import com.zilla.eproc.dto.*;
import com.zilla.eproc.exception.ForbiddenException;
import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;
    @Mock
    private RequestRepository requestRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private SiteRepository siteRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProcurementService procurementService;

    private User testUser;
    private Project testProject;
    private Request testRequest;
    private PurchaseOrder testPO;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setRole(Role.ENGINEER);
        testUser.setName("Test User");

        testProject = new Project();
        testProject.setId(100L);
        testProject.setName("Test Project");
        testProject.setOwner(testUser);

        testRequest = new Request();
        testRequest.setId(200L);
        testRequest.setProject(testProject);
        testRequest.setTitle("Req 1");
        testRequest.setCreatedBy(testUser);

        Site site = new Site();
        site.setId(10L);
        site.setName("Site A");
        testRequest.setSite(site);

        List<Material> materials = new ArrayList<>();
        Material m1 = new Material();
        m1.setName("Cement");
        m1.setQuantity(new BigDecimal("100"));
        materials.add(m1);
        testRequest.setMaterials(materials);

        testPO = new PurchaseOrder();
        testPO.setId(300L);
        testPO.setPoNumber("PO-2024-001");
        testPO.setProject(testProject);
        testPO.setRequest(testRequest);
        testPO.setSite(site);
        testPO.setCreatedBy(testUser);
        testPO.setStatus(PurchaseOrderStatus.OPEN);
        testPO.setItems(new ArrayList<>());
        testPO.setCreatedBy(testUser);

        PurchaseOrderItem item1 = PurchaseOrderItem.builder()
                .id(1L)
                .purchaseOrder(testPO)
                .materialDisplayName("Cement")
                .orderedQty(new BigDecimal("50"))
                .unitPrice(new BigDecimal("10"))
                .totalPrice(new BigDecimal("500"))
                .unit("Bags")
                .deliveryItems(new ArrayList<>())
                .build();
        testPO.getItems().add(item1);
        testPO.setTotalValue(new BigDecimal("500"));
    }

    @Test
    void updatePurchaseOrder_Success() {
        // Setup
        when(purchaseOrderRepository.findByIdWithDetails(300L)).thenReturn(Optional.of(testPO));
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenAnswer(i -> i.getArguments()[0]);

        UpdatePurchaseOrderDTO dto = new UpdatePurchaseOrderDTO();
        dto.setVendorName("New Vendor");
        dto.setNotes("New Notes");

        List<UpdatePurchaseOrderItemDTO> items = new ArrayList<>();
        UpdatePurchaseOrderItemDTO itemDto = new UpdatePurchaseOrderItemDTO();
        itemDto.setMaterialDisplayName("Cement");
        itemDto.setOrderedQty(new BigDecimal("60")); // Increase qty
        itemDto.setUnitPrice(new BigDecimal("11")); // Change price
        itemDto.setUnit("Bags");
        items.add(itemDto);
        dto.setItems(items);

        // Execute
        PurchaseOrderResponseDTO result = procurementService.updatePurchaseOrder(300L, dto, testUser.getEmail());

        // Verify
        assertNotNull(result);
        assertEquals("New Vendor", result.getVendorName());
        assertEquals("New Notes", result.getNotes());
        assertEquals(1, result.getItems().size());
        assertEquals(new BigDecimal("60"), result.getItems().get(0).getOrderedQty());
        assertEquals(new BigDecimal("11"), result.getItems().get(0).getUnitPrice());
    }

    @Test
    void updatePurchaseOrder_Fail_ReduceBelowDelivered() {
        // Add delivery to item
        PurchaseOrderItem item = testPO.getItems().get(0);
        DeliveryItem deliveryItem = new DeliveryItem();
        deliveryItem.setQuantityDelivered(new BigDecimal("40"));
        item.getDeliveryItems().add(deliveryItem);

        when(purchaseOrderRepository.findByIdWithDetails(300L)).thenReturn(Optional.of(testPO));
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        UpdatePurchaseOrderDTO dto = new UpdatePurchaseOrderDTO();
        dto.setItems(new ArrayList<>());
        UpdatePurchaseOrderItemDTO itemDto = new UpdatePurchaseOrderItemDTO();
        itemDto.setMaterialDisplayName("Cement");
        itemDto.setOrderedQty(new BigDecimal("30")); // Try to set 30, but 40 delivered
        itemDto.setUnitPrice(new BigDecimal("10"));
        itemDto.setUnit("Bags");
        dto.getItems().add(itemDto);

        // Execute & Verify
        assertThrows(IllegalArgumentException.class,
                () -> procurementService.updatePurchaseOrder(300L, dto, testUser.getEmail()));
    }

    @Test
    void updatePurchaseOrder_Fail_RemoveDelivered() {
        // Add delivery
        PurchaseOrderItem item = testPO.getItems().get(0);
        DeliveryItem deliveryItem = new DeliveryItem();
        deliveryItem.setQuantityDelivered(new BigDecimal("10"));
        item.getDeliveryItems().add(deliveryItem);

        when(purchaseOrderRepository.findByIdWithDetails(300L)).thenReturn(Optional.of(testPO));
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        UpdatePurchaseOrderDTO dto = new UpdatePurchaseOrderDTO();
        dto.setItems(new ArrayList<>()); // Empty list -> attempts to remove all items

        // Execute & Verify
        assertThrows(IllegalArgumentException.class,
                () -> procurementService.updatePurchaseOrder(300L, dto, testUser.getEmail()));
    }

    @Test
    void updatePurchaseOrder_Fail_Forbidden() {
        User otherUser = new User();
        otherUser.setId(2L);
        otherUser.setEmail("other@example.com");
        otherUser.setRole(Role.ENGINEER);

        when(purchaseOrderRepository.findByIdWithDetails(300L)).thenReturn(Optional.of(testPO));
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(otherUser));

        UpdatePurchaseOrderDTO dto = new UpdatePurchaseOrderDTO();

        // Execute & Verify
        assertThrows(ForbiddenException.class,
                () -> procurementService.updatePurchaseOrder(300L, dto, "other@example.com"));
    }
}
