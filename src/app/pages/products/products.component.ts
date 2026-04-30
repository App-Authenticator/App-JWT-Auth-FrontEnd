import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/service/ProductService';
import { AuthService } from '../../core/service/AuthService';
import { Product, User } from '../../core/model/user.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  currentUser: User | null = null;
  formProduct: Product = { name: '', description: '', price: 0 };
  editingProduct: Product | null = null;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(products => this.products = products);
  }

  createProduct(): void {
    this.productService.createProduct(this.formProduct).subscribe(() => {
      this.resetForm();
      this.loadProducts();
    });
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.formProduct = { ...product };
  }

  updateProduct(): void {
    if (this.editingProduct && this.editingProduct.id) {
      this.productService.updateProduct(this.editingProduct.id, this.formProduct).subscribe(() => {
        this.resetForm();
        this.loadProducts();
      });
    }
  }

  resetForm(): void {
    this.editingProduct = null;
    this.formProduct = { name: '', description: '', price: 0 };
  }

  deleteProduct(id: number): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe(() => this.loadProducts());
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Lógica ABAC para el Frontend
  canEdit(product: Product): boolean {
    if (!this.currentUser) return false;
    // ABAC: Solo el dueño o un ADMIN pueden editar
    const isAdmin = this.currentUser.roles.some(role => 
      role.toUpperCase() === 'ADMIN' || role.toUpperCase() === 'ROLE_ADMIN'
    );
    return isAdmin || product.owner_id === this.currentUser.id;
  }
}
